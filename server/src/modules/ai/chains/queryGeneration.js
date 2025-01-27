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

/**
 * Schema for structured query generation output.
 * Defines the expected format of processed commands.
 */
const QueryGenerationSchema = z.object({
  query: z.object({
    ticketIds: z.array(z.string()).describe('Array of ticket IDs to process'),
    dateRange: z.object({
      start: z.string().optional().describe('Start date in YYYY-MM-DD format'),
      end: z.string().optional().describe('End date in YYYY-MM-DD format')
    }).optional(),
    action: z.enum(['update', 'close', 'reopen', 'assign']).describe('The action to perform on the tickets'),
    parameters: z.record(z.any()).describe('Additional parameters for the action')
  }),
  reasoning: z.string().describe('Explanation of how the query was generated')
});

/**
 * Prompt template for query generation.
 * Instructs the model to extract structured information from natural language.
 */
const prompt = ChatPromptTemplate.fromMessages([
  ['system', 'You are a helpful assistant that converts natural language commands into structured queries for ticket management. Focus on extracting ticket IDs, date ranges, and specific actions to be performed.'],
  ['human', '{input}']
]);

/**
 * Chain for converting natural language commands into structured queries.
 * Uses function calling to ensure type-safe outputs matching QueryGenerationSchema.
 * @type {RunnableSequence}
 */
export const queryGenerationChain = RunnableSequence.from([
  prompt,
  gpt4oMini.bind({ function_call: { name: "output" }, functions: [{ name: "output", parameters: QueryGenerationSchema.shape }] }),
  (response) => response.function_call.arguments
]); 