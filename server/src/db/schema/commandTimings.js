/**
 * Command Timings Schema
 * Tracks execution time for each stage of command processing.
 * Used for progress estimation and performance monitoring.
 * @module db/schema/commandTimings
 */

import { pgTable, uuid, text, timestamp, integer, boolean } from 'drizzle-orm/pg-core';

export const commandTimings = pgTable('command_timings', {
  id: uuid('id').defaultRandom().primaryKey(),
  command_text: text('command_text').notNull(),
  executed_at: timestamp('executed_at').notNull().defaultNow(),
  // Stage durations in milliseconds
  stage_1_duration: integer('stage_1_duration').notNull(), // Understanding command
  stage_2_duration: integer('stage_2_duration').notNull(), // Converting to query
  stage_3_duration: integer('stage_3_duration').notNull(), // Finding tickets
  stage_4_duration: integer('stage_4_duration').notNull(), // Analyzing tickets
  stage_5_duration: integer('stage_5_duration').notNull(), // Preparing changes
  stage_6_duration: integer('stage_6_duration').notNull(), // Ready for review
  matched_tickets_count: integer('matched_tickets_count').notNull(),
  num_tickets_affected: integer('num_tickets_affected').notNull(),
  was_accepted: boolean('was_accepted').notNull()
}); 