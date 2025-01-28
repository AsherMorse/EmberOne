import { sseService } from '../services/sse.service.js';
import { logger } from '../../../utils/logger.js';

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
            duration,
            description: this.currentStage.description,
            completed: true
        });

        this.emitProgress();
        this.currentStage = null;
    }

    /**
     * Mark the command as complete
     * @param {Object} result - The command execution result
     */
    complete(result) {
        this.endStage();
        this.status = 'complete';
        
        sseService.broadcast('command_complete', {
            commandId: this.commandId,
            duration: Date.now() - this.startTime,
            stages: Object.fromEntries(this.stages),
            result
        });
    }

    /**
     * Mark the command as failed
     * @param {Error} error - The error that occurred
     */
    fail(error) {
        this.endStage();
        this.status = 'error';

        sseService.broadcast('command_error', {
            commandId: this.commandId,
            error: error.message,
            stages: Object.fromEntries(this.stages),
            duration: Date.now() - this.startTime
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
        const elapsed = Date.now() - this.startTime;
        const completedStages = Array.from(this.stages.values());
        
        const progress = {
            status: this.status,
            command: this.commandText,
            startTime: this.startTime,
            elapsed,
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