/**
 * Query Generation Chain
 * Converts natural language commands into structured queries for ticket management.
 * Uses function calling to ensure type-safe outputs.
 * @module ai/chains/queryGeneration
 */

import { z } from 'zod';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { RunnableSequence } from '@langchain/core/runnables';
import { gpt4oMini } from '../config.js';
import { Errors } from '../utils/errors.js';

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
  explanation: z.string().describe('AI explains its understanding')
});

/**
 * Prompt template for query generation.
 * Instructs the model to extract structured information from natural language.
 */
const prompt = ChatPromptTemplate.fromMessages([
  ['system', `You convert natural language commands into minimal ticket search queries.
Your job is to extract filters from the command and return them in JSON format.

Input command: "{command}"

Available Filters:
{{
  "query": {{
    "filters": {{
      // Topic Search:
      "title_contains": string,      // Search term in title
      "description_contains": string, // Search term in description

      // Status Filter:
      "status": "OPEN" | "IN_PROGRESS" | "WAITING" | "CLOSED",

      // Priority Filter:
      "priority": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",

      // Date Filters:
      "created_after": string,   // ISO date
      "created_before": string,  // ISO date
      "updated_after": string,   // ISO date
      "updated_before": string,  // ISO date
      "closed_after": string,    // ISO date
      "closed_before": string,   // ISO date

      // People Filters:
      "assigned_agent_id": string,         // Agent ID
      "customer_email_contains": string,   // Customer email
      "customer_name_contains": string     // Customer name
    }}
  }},
  "explanation": string  // What tickets this will find
}}

Rules:
1. For creative changes or general updates, return empty filters to get all tickets
2. For specific changes, include only the relevant filters
3. Always return a valid response, even if the command is unclear

Examples:
Input: "find database tickets"
Output: {{
  "query": {{
    "filters": {{
      "title_contains": "database",
      "description_contains": "database"
    }}
  }},
  "explanation": "Finding tickets containing 'database' in title or description"
}}

Input: "update all tickets"
Output: {{
  "query": {{
    "filters": {{}}
  }},
  "explanation": "Finding all tickets to update"
}}

Input: "make tickets better"
Output: {{
  "query": {{
    "filters": {{}}
  }},
  "explanation": "Finding all tickets to improve"
}}`]
]);

/**
 * Validates and processes the model's response
 * @throws {AIProcessingError} If validation fails
 */
const validateResponse = (response) => {
  try {
    const parsed = QueryGenerationSchema.parse(response);
    
    // Check for valid search query
    const filters = parsed.query.filters;
    const hasSearch = filters.title_contains || filters.description_contains;
    const hasStatus = filters.status;
    const hasPriority = filters.priority;
    const hasDateFilter = filters.created_after || filters.created_before || 
                         filters.updated_after || filters.updated_before ||
                         filters.closed_after || filters.closed_before;
    const hasPeopleFilter = filters.assigned_agent_id || 
                           filters.customer_email_contains ||
                           filters.customer_name_contains;
    
    // Allow empty filters for creative changes (like improving titles/descriptions)
    const isCreativeChange = response.explanation.toLowerCase().includes('improve') ||
                            response.explanation.toLowerCase().includes('realistic') ||
                            response.explanation.toLowerCase().includes('better');
    
    // Remove the ambiguous command check to allow any input
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
 * Uses structured output format matching QueryGenerationSchema.
 * @type {RunnableSequence}
 */
export const queryGenerationChain = RunnableSequence.from([
  prompt,
  gpt4oMini.bind({ 
    response_format: { type: "json_object" },
    schema: {
      type: "object",
      properties: {
        query: {
          type: "object",
          properties: {
            filters: {
              type: "object",
              properties: {
                title_contains: { type: "string" },
                description_contains: { type: "string" },
                status: { 
                  type: "string", 
                  enum: ["OPEN", "IN_PROGRESS", "WAITING", "CLOSED"]
                },
                created_after: { type: "string" },
                created_before: { type: "string" },
                updated_after: { type: "string" },
                updated_before: { type: "string" },
                closed_after: { type: "string" },
                closed_before: { type: "string" },
                assigned_agent_id: { type: "string" },
                customer_email_contains: { type: "string" },
                customer_name_contains: { type: "string" }
              },
              additionalProperties: false
            }
          },
          required: ["filters"]
        },
        explanation: { type: "string" }
      },
      required: ["query", "explanation"]
    }
  }),
  (response) => {
    try {
      const content = response.content;
      console.log('Raw model response:', content); // Debug log
      return typeof content === 'string' ? JSON.parse(content) : content;
    } catch (error) {
      throw new Error(`Failed to parse response: ${error.message}`);
    }
  },
  validateResponse
]); 