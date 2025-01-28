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
Your job is to extract ONLY the minimum filters needed to match what was asked for and return them in JSON format.

Input command: "{command}"

Available Filters (use ONLY what's needed):
{{
  "query": {{
    "filters": {{
      // Topic Search (REQUIRED for any topic/keyword mentioned):
      "title_contains": string,      // MUST include search term
      "description_contains": string, // MUST use same term as title_contains

      // Status Filter (ONLY if status mentioned):
      "status": "OPEN" | "IN_PROGRESS" | "WAITING" | "CLOSED",

      // Priority Filter (ONLY if priority mentioned):
      "priority": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",

      // Date Filters (ONLY if dates mentioned):
      "created_after": string,   // ISO date
      "created_before": string,  // ISO date
      "updated_after": string,   // ISO date
      "updated_before": string,  // ISO date
      "closed_after": string,    // ISO date
      "closed_before": string,   // ISO date

      // People Filters (ONLY if people mentioned):
      "assigned_agent_id": string,         // Agent ID
      "customer_email_contains": string,   // Customer email
      "customer_name_contains": string     // Customer name
    }}
  }},
  "explanation": string  // What tickets this will find
}}

Rules:
1. ONLY extract search terms from the input command text
2. If a topic/keyword is mentioned in the command (like "database", "API", etc):
   - You MUST include both title_contains and description_contains
   - Use the EXACT same search term in both
   - Example: if command says "database", use "database" (not "API" or anything else)

3. ONLY include status if explicitly mentioned in the command:
   - "open" -> status: "OPEN"
   - "in progress" -> status: "IN_PROGRESS"
   - No status mentioned -> don't include status

4. ONLY include priority if explicitly mentioned in the command:
   - "critical" -> priority: "CRITICAL"
   - "high" -> priority: "HIGH"
   - "medium" -> priority: "MEDIUM"
   - "low" -> priority: "LOW"

5. NEVER return empty filters - there must always be at least one filter

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

Input: "find open API tickets"
Output: {{
  "query": {{
    "filters": {{
      "status": "OPEN",
      "title_contains": "API",
      "description_contains": "API"
    }}
  }},
  "explanation": "Finding open tickets containing 'API' in title or description"
}}

Input: "set all high priority tickets to medium priority"
Output: {{
  "query": {{
    "filters": {{
      "priority": "HIGH"
    }}
  }},
  "explanation": "Finding all tickets with high priority to change them to medium priority"
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
    
    // At least one type of filter must be present
    if (!hasSearch && !hasStatus && !hasPriority && !hasDateFilter && !hasPeopleFilter) {
      throw Errors.ambiguousCommand();
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