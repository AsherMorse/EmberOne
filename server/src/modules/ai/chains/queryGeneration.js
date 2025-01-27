/**
 * Query Generation Chain
 * Converts natural language commands into structured queries for ticket management.
 * Uses function calling to ensure type-safe outputs.
 * @module ai/chains/queryGeneration
 */

import { z } from 'zod';
import { ChatPromptTemplate } from 'langchain/prompts';
import { RunnableSequence } from 'langchain/runnables';
import { gpt4oMini } from '../config.js';
import { Errors } from '../utils/errors.js';

// Maximum number of tickets that can be matched
const MAX_MATCHES = 25;

/**
 * Schema for structured query generation output.
 * Defines the expected format of processed commands.
 */
const QueryGenerationSchema = z.object({
  query: z.object({
    filters: z.object({
      title_contains: z.string().optional(),
      description_contains: z.string().optional(),
      status: z.enum(['OPEN', 'IN_PROGRESS', 'WAITING', 'CLOSED']).optional(),
      priority: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']).optional(),
      created_after: z.string().datetime().optional().describe('ISO date'),
      created_before: z.string().datetime().optional().describe('ISO date'),
      updated_after: z.string().datetime().optional().describe('ISO date'),
      updated_before: z.string().datetime().optional().describe('ISO date'),
      closed_after: z.string().datetime().optional().describe('ISO date'),
      closed_before: z.string().datetime().optional().describe('ISO date'),
      assigned_agent_id: z.string().optional(),
      customer_email_contains: z.string().optional(),
      customer_name_contains: z.string().optional()
    }),
    sort: z.object({
      field: z.enum(['created_at', 'updated_at', 'priority', 'status']),
      order: z.enum(['asc', 'desc'])
    }).optional()
  }),
  explanation: z.string().describe('AI explains its understanding'),
  estimated_matches: z.number().max(MAX_MATCHES, 'Too many matches')
});

/**
 * Prompt template for query generation.
 * Instructs the model to extract structured information from natural language.
 */
const prompt = ChatPromptTemplate.fromMessages([
  ['system', `You are a helpful AI assistant converting natural language commands into structured ticket queries.
Current date: "{current_date}"
The admin wants to: "{command}"
Convert this into a query that will find the relevant tickets.
Only return a JSON object matching the QueryResponse type.
Be precise and literal in your interpretation.
Estimate the number of matches - if you think it might exceed ${MAX_MATCHES}, make the filters more specific.`],
  ['human', '{input}']
]);

/**
 * Validates and processes the model's response
 * @throws {AIProcessingError} If validation fails or estimated matches exceed limit
 */
const validateResponse = (response) => {
  try {
    const parsed = QueryGenerationSchema.parse(response);
    
    // Check for ambiguous queries
    const filterCount = Object.keys(parsed.query.filters).length;
    if (filterCount === 0) {
      throw Errors.ambiguousCommand();
    }

    // Check estimated matches
    if (parsed.estimated_matches > MAX_MATCHES) {
      throw Errors.tooManyMatches(parsed.estimated_matches, MAX_MATCHES);
    }

    if (parsed.estimated_matches === 0) {
      throw Errors.noMatches();
    }

    return parsed;
  } catch (error) {
    if (error.name === 'AIProcessingError') {
      throw error;
    }
    // Handle Zod validation errors
    if (error.errors?.[0]) {
      const zodError = error.errors[0];
      throw Errors.validationError(
        zodError.path.join('.'),
        zodError.message
      );
    }
    throw Errors.invalidCommand(error.message);
  }
};

/**
 * Chain for converting natural language commands into structured queries.
 * Uses function calling to ensure type-safe outputs matching QueryGenerationSchema.
 * @type {RunnableSequence}
 */
export const queryGenerationChain = RunnableSequence.from([
  prompt,
  gpt4oMini.bind({ function_call: { name: "output" }, functions: [{ name: "output", parameters: QueryGenerationSchema.shape }] }),
  (response) => response.function_call.arguments,
  validateResponse
]); 