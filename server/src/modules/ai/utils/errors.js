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
  constructor(message, error, details) {
    super(message);
    this.name = 'AIProcessingError';
    this.error = error;
    this.details = details;
    this.code = 'AI_ERROR';
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
    `Query matches too many tickets (${found} found, limit is ${limit})`,
    'TOO_MANY_MATCHES',
    { found, limit },
    'Try adding more specific filters to reduce the number of matches'
  ),

  noMatches: () => new AIProcessingError(
    'No tickets match these criteria',
    'NO_MATCHES',
    {},
    'Try broadening your search criteria or check if the filters are too restrictive'
  ),

  invalidCommand: (message, details = {}) => new AIProcessingError(
    message,
    'INVALID_COMMAND',
    details,
    'Try using one of the example commands as a template'
  ),

  ambiguousCommand: () => new AIProcessingError(
    'Command is too ambiguous to process',
    'AMBIGUOUS_COMMAND',
    {},
    'Please be more specific about what you want to do with the tickets'
  ),

  validationError: (field, value) => new AIProcessingError(
    `Invalid value for ${field}`,
    'VALIDATION_ERROR',
    { field, value },
    `Please provide a valid value for ${field}`
  ),

  invalidStateTransition: (currentState, targetState) => new AIProcessingError(
    `Cannot transition ticket from ${currentState} to ${targetState}`,
    'INVALID_STATE_TRANSITION',
    { current_state: currentState, target_state: targetState },
    'Check the allowed state transitions and try a different status change'
  ),

  highImpactChanges: (impactLevel, affectedTickets) => new AIProcessingError(
    `Changes have ${impactLevel} impact level affecting ${affectedTickets} tickets`,
    'HIGH_IMPACT_CHANGES',
    { impact_level: impactLevel, affected_tickets: affectedTickets },
    'Consider breaking this into smaller, more focused changes'
  ),

  insufficientChanges: () => new AIProcessingError(
    'No meaningful changes specified in the update',
    'INSUFFICIENT_CHANGES',
    {},
    'Specify at least one field to update for each ticket'
  ),

  inconsistentChanges: (message) => new AIProcessingError(
    message,
    'INCONSISTENT_CHANGES',
    {},
    'Ensure similar tickets receive similar updates for consistency'
  ),

  /**
   * Create an error for failed query generation
   */
  queryGeneration: (message, details = {}) => new AIProcessingError(
    message,
    'QUERY_GENERATION_FAILED',
    details
  ),

  /**
   * Create an error for failed change generation
   */
  changeGeneration: (message, details = {}) => new AIProcessingError(
    message,
    'CHANGE_GENERATION_FAILED',
    details
  ),

  /**
   * Create an error for failed ticket operations
   */
  ticketOperation: (message, details = {}) => new AIProcessingError(
    message,
    'TICKET_OPERATION_FAILED',
    details
  ),

  /**
   * Check if an error is an AIProcessingError
   */
  isAIError: (error) => error instanceof AIProcessingError
}; 