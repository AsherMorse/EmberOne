import { sseService } from '../services/sse.service.js';
import { logger } from '../../../utils/logger.js';
import { db } from '../../../db/index.js';
import { commandTimings } from '../../../db/schema/index.js';

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
    stage_1: 500,  // Understanding command
    stage_2: 1000, // Converting to query
    stage_3: 1500, // Finding tickets
    stage_4: 1000, // Analyzing tickets
    stage_5: 1500, // Preparing changes
    stage_6: 500   // Ready for review
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
    }

    /**
     * Initialize timer with estimated durations based on similar commands
     * @param {number} ticketCount - Expected number of tickets to process
     */
    async initializeEstimates(ticketCount) {
        this.matchedTicketsCount = ticketCount;
        this.emitProgress();
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
            description: COMMAND_STAGES[stageNumber]
        };

        this.status = 'processing';
        this.emitProgress();
    }

    /**
     * End timing for the current stage
     */
    endStage() {
        if (!this.currentStage) return;

        const duration = Date.now() - this.currentStage.startTime;
        this.stages.set(this.currentStage.number, {
            number: this.currentStage.number,
            duration,
            description: this.currentStage.description,
            completed: true
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
            const percentage = Math.min(Math.round((stageElapsed / estimatedDuration) * 100), 99);

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