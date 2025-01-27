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
    filters: z.object({
      title_contains: z.string().optional(),
      description_contains: z.string().optional(),
      status: z.enum(['OPEN', 'IN_PROGRESS', 'WAITING', 'CLOSED']).optional(),
      priority: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']).optional(),
      created_after: z.string().optional().describe('ISO date'),
      created_before: z.string().optional().describe('ISO date'),
      updated_after: z.string().optional().describe('ISO date'),
      updated_before: z.string().optional().describe('ISO date'),
      closed_after: z.string().optional().describe('ISO date'),
      closed_before: z.string().optional().describe('ISO date'),
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
  estimated_matches: z.number()
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
Be precise and literal in your interpretation.`],
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