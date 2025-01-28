import { sseService } from '../services/sse.service.js';
import { logger } from '../../../utils/logger.js';
import { db } from '../../../db/index.js';
import { commandTimings } from '../../../db/schema/index.js';
import { commandTimingsService } from '../services/commandTimings.service.js';

/**
 * Stage descriptions for command processing
 */
export const COMMAND_STAGES = {
    1: 'Understanding command',
    2: 'Converting to query',
    3: 'Finding tickets',
    4: 'Analyzing tickets',
    5: 'Preparing changes',
    6: 'Ready for review'
};

/**
 * Default stage durations in milliseconds
 */
export const DEFAULT_DURATIONS = {
    stage_1: 1000,  // Understanding command
    stage_2: 2000,  // Converting to query
    stage_3: 2000,  // Finding tickets
    stage_4: 1500,  // Analyzing tickets
    stage_5: 2000,  // Preparing changes
    stage_6: 1000   // Ready for review
};

/**
 * CommandTimer class for tracking command execution progress
 * and emitting events via SSE
 */
export class CommandTimer {
    /**
     * Create a new CommandTimer instance
     * @param {string} commandId - Unique identifier for the command
     * @param {string} commandText - The command text being processed
     */
    constructor(commandId, commandText) {
        this.commandId = commandId;
        this.commandText = commandText;
        this.startTime = Date.now();
        this.stages = new Map();
        this.currentStage = null;
        this.estimatedDurations = { ...DEFAULT_DURATIONS };
        this.matchedTicketsCount = 0;
        this.status = 'initializing';
        this.lastProgressUpdate = Date.now();
        this.progressUpdateInterval = 100; // Update progress every 100ms
    }

    /**
     * Calculate a smooth progress percentage
     * @param {number} elapsed - Time elapsed in milliseconds
     * @param {number} estimated - Estimated duration in milliseconds
     * @returns {number} Progress percentage (0-100)
     */
    calculateProgress(elapsed, estimated) {
        // Use a sigmoid function to smooth out the progress
        const x = (elapsed / estimated) * 6 - 3; // Scale to -3 to 3 for sigmoid
        const sigmoid = 1 / (1 + Math.exp(-x));
        return Math.min(Math.round(sigmoid * 100), 99);
    }

    /**
     * Initialize timer with estimated durations based on similar commands
     * @param {number} ticketCount - Expected number of tickets to process
     */
    async initializeEstimates(ticketCount) {
        try {
            // Get average durations from historical data
            const averageDurations = await commandTimingsService.getAverageStageDurations();
            logger.debug('Using average durations:', averageDurations);
            
            // Use average durations or fallback to defaults
            this.estimatedDurations = {
                stage_1: averageDurations.stage_1,
                stage_2: averageDurations.stage_2,
                stage_3: averageDurations.stage_3,
                stage_4: averageDurations.stage_4,
                stage_5: averageDurations.stage_5,
                stage_6: averageDurations.stage_6
            };

            // Adjust durations based on ticket count
            if (ticketCount > 0) {
                this.estimatedDurations.stage_3 += ticketCount * 100; // Add 100ms per ticket for finding
                this.estimatedDurations.stage_4 += ticketCount * 150; // Add 150ms per ticket for analysis
                this.estimatedDurations.stage_5 += ticketCount * 100; // Add 100ms per ticket for changes
            }

            this.matchedTicketsCount = ticketCount;
            this.emitProgress();
        } catch (error) {
            logger.error('Failed to get average durations, using defaults:', error);
            // Fallback to default durations
            this.estimatedDurations = { ...DEFAULT_DURATIONS };
            if (ticketCount > 0) {
                this.estimatedDurations.stage_3 += ticketCount * 100;
                this.estimatedDurations.stage_4 += ticketCount * 150;
                this.estimatedDurations.stage_5 += ticketCount * 100;
            }
            this.matchedTicketsCount = ticketCount;
            this.emitProgress();
        }
    }

    /**
     * Start timing a specific stage
     * @param {number} stageNumber - The stage number (1-6)
     */
    startStage(stageNumber) {
        if (this.currentStage) {
            this.endStage();
        }

        this.currentStage = {
            number: stageNumber,
            startTime: Date.now(),
            description: COMMAND_STAGES[stageNumber],
            progressInterval: setInterval(() => this.emitProgress(), this.progressUpdateInterval)
        };

        this.status = 'processing';
        this.emitProgress();
    }

    /**
     * End timing for the current stage
     */
    endStage() {
        if (!this.currentStage) return;

        // Clear the progress update interval
        if (this.currentStage.progressInterval) {
            clearInterval(this.currentStage.progressInterval);
        }

        const duration = Date.now() - this.currentStage.startTime;
        this.stages.set(this.currentStage.number, {
            number: this.currentStage.number,
            duration,
            description: this.currentStage.description,
            completed: true,
            percentage: 100 // Set to 100% when complete
        });

        this.emitProgress();
        this.currentStage = null;
    }

    /**
     * Save timing data to the database
     * @param {Object} result - Command execution result
     * @param {number} result.matched_tickets_count - Number of tickets matched
     * @param {number} result.num_tickets_affected - Number of tickets modified
     * @param {boolean} result.was_accepted - Whether changes were accepted
     */
    async save({ matched_tickets_count, num_tickets_affected, was_accepted }) {
        this.endStage(); // Ensure current stage is ended

        // Convert stages Map to object for database
        const timings = {
            command_text: this.commandText,
            matched_tickets_count,
            num_tickets_affected,
            was_accepted,
            stage_1_duration: this.stages.get(1)?.duration || 0,
            stage_2_duration: this.stages.get(2)?.duration || 0,
            stage_3_duration: this.stages.get(3)?.duration || 0,
            stage_4_duration: this.stages.get(4)?.duration || 0,
            stage_5_duration: this.stages.get(5)?.duration || 0,
            stage_6_duration: this.stages.get(6)?.duration || 0
        };

        await db.insert(commandTimings).values(timings);
    }

    /**
     * Mark the command as complete and optionally save timing data
     * @param {Object} result - The command execution result
     * @param {boolean} [shouldSave=true] - Whether to save timing data to database
     */
    async complete(result, shouldSave = true) {
        this.endStage();
        this.status = 'complete';
        
        // Save timing data if requested
        if (shouldSave) {
            await this.save({
                matched_tickets_count: result.matchCount || 0,
                num_tickets_affected: result.suggestedChanges?.changes?.length || 0,
                was_accepted: true
            });
        }
        
        // Calculate total duration from stage durations
        const totalDuration = Array.from(this.stages.values())
            .reduce((sum, stage) => sum + stage.duration, 0);
        
        sseService.broadcast('command_complete', {
            commandId: this.commandId,
            duration: totalDuration,
            stages: Object.fromEntries(this.stages),
            result
        });
    }

    /**
     * Mark the command as failed and optionally save timing data
     * @param {Error} error - The error that occurred
     * @param {boolean} [shouldSave=true] - Whether to save timing data to database
     */
    async fail(error, shouldSave = true) {
        this.endStage();
        this.status = 'error';

        // Save timing data if requested
        if (shouldSave) {
            await this.save({
                matched_tickets_count: 0,
                num_tickets_affected: 0,
                was_accepted: false
            });
        }

        // Calculate total duration from stage durations
        const totalDuration = Array.from(this.stages.values())
            .reduce((sum, stage) => sum + stage.duration, 0);

        sseService.broadcast('command_error', {
            commandId: this.commandId,
            error: error.message,
            stages: Object.fromEntries(this.stages),
            duration: totalDuration
        });
    }

    /**
     * Emit current progress via SSE
     */
    emitProgress() {
        const progress = this.getProgress();
        sseService.broadcast('command_progress', {
            commandId: this.commandId,
            ...progress
        });
    }

    /**
     * Get current command progress
     * @returns {Object} Progress information
     */
    getProgress() {
        const completedStages = Array.from(this.stages.values());
        const totalElapsed = completedStages.reduce((sum, stage) => sum + stage.duration, 0);
        
        const progress = {
            status: this.status,
            command: this.commandText,
            startTime: this.startTime,
            elapsed: totalElapsed,
            matchedTicketsCount: this.matchedTicketsCount,
            stages: completedStages,
            currentStage: null
        };

        if (this.currentStage) {
            const stageElapsed = Date.now() - this.currentStage.startTime;
            const estimatedDuration = this.estimatedDurations[`stage_${this.currentStage.number}`];
            const percentage = this.calculateProgress(stageElapsed, estimatedDuration);

            progress.currentStage = {
                number: this.currentStage.number,
                description: this.currentStage.description,
                startTime: this.currentStage.startTime,
                elapsed: stageElapsed,
                estimatedDuration,
                percentage
            };
        }

        return progress;
    }
} 