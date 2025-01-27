/**
 * Error types and utilities for AI module
 * Defines standardized error responses for query and change generation.
 * @module ai/utils/errors
 */

import { z } from 'zod';

/**
 * Schema for standardized error responses
 */
export const ErrorResponseSchema = z.object({
  error: z.enum([
    'TOO_MANY_MATCHES',
    'NO_MATCHES', 
    'INVALID_COMMAND',
    'AMBIGUOUS_COMMAND',
    'VALIDATION_ERROR',
    'INVALID_STATE_TRANSITION',
    'HIGH_IMPACT_CHANGES',
    'INSUFFICIENT_CHANGES',
    'INCONSISTENT_CHANGES'
  ]),
  message: z.string(),
  details: z.object({
    limit: z.number().optional(),
    found: z.number().optional(),
    field: z.string().optional(),
    value: z.string().optional(),
    current_state: z.string().optional(),
    target_state: z.string().optional(),
    impact_level: z.string().optional(),
    affected_tickets: z.number().optional()
  }),
  suggestion: z.string()
});

/**
 * Custom error class for AI processing errors
 */
export class AIProcessingError extends Error {
  constructor(type, message, details = {}, suggestion = '') {
    super(message);
    this.name = 'AIProcessingError';
    this.error = type;
    this.details = details;
    this.suggestion = suggestion;
  }

  /**
   * Convert error to response format matching ErrorResponseSchema
   */
  toResponse() {
    return {
      error: this.error,
      message: this.message,
      details: this.details,
      suggestion: this.suggestion
    };
  }
}

/**
 * Error factory functions for common error cases
 */
export const Errors = {
  tooManyMatches: (found, limit) => new AIProcessingError(
    'TOO_MANY_MATCHES',
    `Query matches too many tickets (${found} found, limit is ${limit})`,
    { found, limit },
    'Try adding more specific filters to reduce the number of matches'
  ),

  noMatches: () => new AIProcessingError(
    'NO_MATCHES',
    'No tickets match these criteria',
    {},
    'Try broadening your search criteria or check if the filters are too restrictive'
  ),

  invalidCommand: (message) => new AIProcessingError(
    'INVALID_COMMAND',
    message,
    {},
    'Try using one of the example commands as a template'
  ),

  ambiguousCommand: () => new AIProcessingError(
    'AMBIGUOUS_COMMAND',
    'Command is too ambiguous to process',
    {},
    'Please be more specific about what you want to do with the tickets'
  ),

  validationError: (field, value) => new AIProcessingError(
    'VALIDATION_ERROR',
    `Invalid value for ${field}`,
    { field, value },
    `Please provide a valid value for ${field}`
  ),

  invalidStateTransition: (currentState, targetState) => new AIProcessingError(
    'INVALID_STATE_TRANSITION',
    `Cannot transition ticket from ${currentState} to ${targetState}`,
    { current_state: currentState, target_state: targetState },
    'Check the allowed state transitions and try a different status change'
  ),

  highImpactChanges: (impactLevel, affectedTickets) => new AIProcessingError(
    'HIGH_IMPACT_CHANGES',
    `Changes have ${impactLevel} impact level affecting ${affectedTickets} tickets`,
    { impact_level: impactLevel, affected_tickets: affectedTickets },
    'Consider breaking this into smaller, more focused changes'
  ),

  insufficientChanges: () => new AIProcessingError(
    'INSUFFICIENT_CHANGES',
    'No meaningful changes specified in the update',
    {},
    'Specify at least one field to update for each ticket'
  ),

  inconsistentChanges: (message) => new AIProcessingError(
    'INCONSISTENT_CHANGES',
    message,
    {},
    'Ensure similar tickets receive similar updates for consistency'
  )
}; 