/**
 * Change Generation Chain
 * Generates specific changes for tickets based on query results and original command.
 * Includes impact assessment and validation.
 * @module ai/chains/changeGeneration
 */

import { z } from 'zod';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { RunnableSequence } from '@langchain/core/runnables';
import { gpt4o } from '../config.js';
import { Errors } from '../utils/errors.js';

/**
 * Schema for ticket state representation
 */
const TicketStateSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  status: z.string().optional(),
  priority: z.string().optional(),
  assigned_agent_id: z.string().optional(),
  customer: z.object({
    name: z.string().optional(),
    email: z.string().optional()
  }).optional()
});

/**
 * Schema for ticket updates
 */
const TicketUpdatesSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'WAITING', 'CLOSED']).optional(),
  priority: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']).optional(),
  assigned_agent_id: z.string().optional()
}).refine(data => Object.keys(data).length > 0, {
  message: "At least one update field must be provided"
});

/**
 * Schema for impact assessment
 */
const ImpactAssessmentSchema = z.object({
  level: z.enum(['low', 'medium', 'high']),
  factors: z.object({
    num_tickets: z.number().int(),
    field_changes: z.number().int(),
    status_changes: z.number().int().optional(),
    priority_shifts: z.object({
      up: z.number().int().min(0).optional(),
      down: z.number().int().min(0).optional()
    }).optional(),
    assignment_changes: z.number().int().optional()
  }),
  reasoning: z.string()
});

/**
 * Schema for change generation output
 */
const ChangeGenerationSchema = z.object({
  changes: z.array(z.object({
    ticket_id: z.string(),
    current_state: TicketStateSchema,
    updates: TicketUpdatesSchema,
    explanation: z.string()
  })),
  summary: z.string(),
  impact_assessment: ImpactAssessmentSchema
});

/**
 * Validates the changes against business rules
 * @throws {AIProcessingError} If validation fails
 */
const validateChanges = (changes) => {
  try {
    const parsed = ChangeGenerationSchema.parse(changes);
    
    // Ensure we have at least one change
    if (parsed.changes.length === 0) {
      throw Errors.insufficientChanges();
    }

    // Ensure at least one field is being updated for each change
    for (const change of parsed.changes) {
      const updateFields = Object.keys(change.updates);
      if (updateFields.length === 0) {
        throw Errors.insufficientChanges();
      }
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
 * Prompt template for change generation.
 * Instructs the model to generate specific changes for matched tickets.
 */
const prompt = ChatPromptTemplate.fromMessages([
  ['system', `You are a JSON-only response generator for ticket changes.
DO NOT include any explanatory text before or after the JSON.
ONLY return a valid JSON object.

The admin wants to: "{command}"
Here are the matching tickets: {tickets}

IMPORTANT: ONLY suggest changes for tickets that were provided in the input.
DO NOT make up ticket IDs or reference tickets that weren't in the input.
Each ticket_id in your response MUST match one from the input tickets.

Return EXACTLY this structure (fields marked with ? are optional but don't include the ? in the output):
{{
  "changes": [
    {{
      "ticket_id": "string",  // MUST match an ID from input tickets
      "current_state": {{
        "title": "string",          // optional
        "description": "string",     // optional
        "status": "string",         // optional
        "priority": "string",       // optional
        "assigned_agent_id": "string",  // optional
        "customer": {{              // optional
          "name": "string",         // optional
          "email": "string"         // optional
        }}
      }},
      "updates": {{
        "title": "string",          // optional
        "description": "string",     // optional
        "status": "OPEN" | "IN_PROGRESS" | "WAITING" | "CLOSED",  // optional
        "priority": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",       // optional
        "assigned_agent_id": "string"  // optional
      }},
      "explanation": "string"
    }}
  ],
  "summary": "string",
  "impact_assessment": {{
    "level": "low" | "medium" | "high",
    "factors": {{
      "num_tickets": number,
      "field_changes": number,
      "status_changes": number,      // optional
      "priority_shifts": {{          // optional
        "up": number,
        "down": number
      }},
      "assignment_changes": number   // optional
    }},
    "reasoning": "string"
  }}
}}

Guidelines (but ONLY return JSON, no other text):
1. ONLY suggest changes for tickets that were provided in the input
2. For creative changes, generate professional content
3. Keep existing context and key information
4. Make titles concise but descriptive
5. Make descriptions clear and detailed
6. Use integers for all numbers
7. Include clear explanations for changes`]
]);

/**
 * Chain for generating specific changes for matched tickets.
 * Uses function calling to ensure type-safe outputs matching ChangeGenerationSchema.
 * @type {RunnableSequence}
 */
export const changeGenerationChain = RunnableSequence.from([
  prompt,
  gpt4o,
  (response) => {
    try {
      const content = response.content;
      console.log('Raw model response:', content); // Debug log
      return typeof content === 'string' ? JSON.parse(content) : content;
    } catch (error) {
      throw new Error(`Failed to parse response: ${error.message}`);
    }
  },
  validateChanges
]); 