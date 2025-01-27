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
    'VALIDATION_ERROR'
  ]),
  message: z.string(),
  details: z.object({
    limit: z.number().optional(),
    found: z.number().optional(),
    field: z.string().optional(),
    value: z.string().optional()
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
  )
}; 