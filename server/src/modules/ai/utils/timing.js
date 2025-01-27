/**
 * Command Timing Utilities
 * Tracks and manages execution timing for command processing stages.
 * @module ai/utils/timing
 */

import { db } from '../../../db/index.js';
import { commandTimings } from '../../../db/schema/index.js';

// Default durations in milliseconds for each stage
export const DEFAULT_DURATIONS = {
  stage_1: 500,  // Understanding command
  stage_2: 1000, // Converting to query
  stage_3: 1500, // Finding tickets
  stage_4: 1000, // Analyzing tickets
  stage_5: 1500, // Preparing changes
  stage_6: 500   // Ready for review
};

/**
 * Tracks timing for a command execution session
 */
export class CommandTimer {
  constructor(commandText) {
    this.commandText = commandText;
    this.startTime = Date.now();
    this.stages = new Map();
    this.currentStage = null;
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
      startTime: Date.now()
    };
  }

  /**
   * End timing for the current stage
   */
  endStage() {
    if (!this.currentStage) return;
    
    const duration = Date.now() - this.currentStage.startTime;
    this.stages.set(this.currentStage.number, duration);
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
      stage_1_duration: this.stages.get(1) || DEFAULT_DURATIONS.stage_1,
      stage_2_duration: this.stages.get(2) || DEFAULT_DURATIONS.stage_2,
      stage_3_duration: this.stages.get(3) || DEFAULT_DURATIONS.stage_3,
      stage_4_duration: this.stages.get(4) || DEFAULT_DURATIONS.stage_4,
      stage_5_duration: this.stages.get(5) || DEFAULT_DURATIONS.stage_5,
      stage_6_duration: this.stages.get(6) || DEFAULT_DURATIONS.stage_6
    };

    await db.insert(commandTimings).values(timings);
  }

  /**
   * Calculate progress for the current stage
   * @returns {Object} Progress information
   */
  getProgress() {
    if (!this.currentStage) return null;

    const elapsed = Date.now() - this.currentStage.startTime;
    const estimated = DEFAULT_DURATIONS[`stage_${this.currentStage.number}`];
    const percentage = Math.min(Math.round((elapsed / estimated) * 100), 99);

    return {
      stage: {
        id: this.currentStage.number,
        name: getStageDescription(this.currentStage.number),
        started_at: this.currentStage.startTime,
        estimated_duration: estimated
      },
      percentage,
      is_stage_complete: false
    };
  }
}

/**
 * Get description for a stage number
 * @param {number} stageNumber - The stage number (1-6)
 * @returns {string} Stage description
 */
function getStageDescription(stageNumber) {
  const descriptions = {
    1: 'Understanding command',
    2: 'Converting to query',
    3: 'Finding tickets',
    4: 'Analyzing tickets',
    5: 'Preparing changes',
    6: 'Ready for review'
  };
  return descriptions[stageNumber] || 'Unknown stage';
} 