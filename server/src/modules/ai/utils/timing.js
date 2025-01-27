/**
 * Command Timing Utilities
 * Tracks and manages execution timing for command processing stages.
 * @module ai/utils/timing
 */

import { db } from '../../../db/index.js';
import { commandTimings } from '../../../db/schema/index.js';
import { avg, desc, sql } from 'drizzle-orm';

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
 * Get average durations from recent command executions
 * @param {number} limit - Number of recent records to consider
 * @returns {Promise<Object>} Average durations for each stage
 */
export async function getAverageDurations(limit = 100) {
  const result = await db.select({
    stage_1: avg(commandTimings.stage_1_duration),
    stage_2: avg(commandTimings.stage_2_duration),
    stage_3: avg(commandTimings.stage_3_duration),
    stage_4: avg(commandTimings.stage_4_duration),
    stage_5: avg(commandTimings.stage_5_duration),
    stage_6: avg(commandTimings.stage_6_duration),
  })
  .from(commandTimings)
  .orderBy(desc(commandTimings.executed_at))
  .limit(limit);

  // If no historical data, return defaults
  if (!result?.[0]?.stage_1) {
    return DEFAULT_DURATIONS;
  }

  return {
    stage_1: Math.round(result[0].stage_1),
    stage_2: Math.round(result[0].stage_2),
    stage_3: Math.round(result[0].stage_3),
    stage_4: Math.round(result[0].stage_4),
    stage_5: Math.round(result[0].stage_5),
    stage_6: Math.round(result[0].stage_6)
  };
}

/**
 * Get weighted average durations based on ticket count similarity
 * @param {number} ticketCount - Number of tickets in current operation
 * @returns {Promise<Object>} Weighted average durations
 */
export async function getWeightedAverageDurations(ticketCount) {
  const result = await db.select({
    stage_1: sql`AVG(stage_1_duration * (1.0 / (ABS(matched_tickets_count - ${ticketCount}) + 1)))`,
    stage_2: sql`AVG(stage_2_duration * (1.0 / (ABS(matched_tickets_count - ${ticketCount}) + 1)))`,
    stage_3: sql`AVG(stage_3_duration * (1.0 / (ABS(matched_tickets_count - ${ticketCount}) + 1)))`,
    stage_4: sql`AVG(stage_4_duration * (1.0 / (ABS(matched_tickets_count - ${ticketCount}) + 1)))`,
    stage_5: sql`AVG(stage_5_duration * (1.0 / (ABS(matched_tickets_count - ${ticketCount}) + 1)))`,
    stage_6: sql`AVG(stage_6_duration * (1.0 / (ABS(matched_tickets_count - ${ticketCount}) + 1)))`,
  })
  .from(commandTimings)
  .where(sql`executed_at > NOW() - INTERVAL '7 days'`);

  // If no historical data, return defaults
  if (!result?.[0]?.stage_1) {
    return DEFAULT_DURATIONS;
  }

  return {
    stage_1: Math.round(result[0].stage_1),
    stage_2: Math.round(result[0].stage_2),
    stage_3: Math.round(result[0].stage_3),
    stage_4: Math.round(result[0].stage_4),
    stage_5: Math.round(result[0].stage_5),
    stage_6: Math.round(result[0].stage_6)
  };
}

/**
 * Tracks timing for a command execution session
 */
export class CommandTimer {
  constructor(commandText) {
    this.commandText = commandText;
    this.startTime = Date.now();
    this.stages = new Map();
    this.currentStage = null;
    this.estimatedDurations = DEFAULT_DURATIONS;
  }

  /**
   * Initialize with historical averages
   * @param {number} ticketCount - Expected number of tickets to process
   */
  async initializeEstimates(ticketCount) {
    // Get weighted averages based on similar operations
    this.estimatedDurations = await getWeightedAverageDurations(ticketCount);
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
      stage_1_duration: this.stages.get(1) || this.estimatedDurations.stage_1,
      stage_2_duration: this.stages.get(2) || this.estimatedDurations.stage_2,
      stage_3_duration: this.stages.get(3) || this.estimatedDurations.stage_3,
      stage_4_duration: this.stages.get(4) || this.estimatedDurations.stage_4,
      stage_5_duration: this.stages.get(5) || this.estimatedDurations.stage_5,
      stage_6_duration: this.stages.get(6) || this.estimatedDurations.stage_6
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
    const estimated = this.estimatedDurations[`stage_${this.currentStage.number}`];
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