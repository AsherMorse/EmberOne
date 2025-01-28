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

    // Check for invalid state transitions
    for (const change of parsed.changes) {
      // Validate state transitions
      if (change.current_state.status === 'CLOSED' && 
          change.updates.status && 
          !['OPEN', 'IN_PROGRESS'].includes(change.updates.status)) {
        throw Errors.invalidStateTransition('CLOSED', change.updates.status);
      }

      // Ensure at least one field is being updated
      const updateFields = Object.keys(change.updates);
      if (updateFields.length === 0) {
        throw Errors.insufficientChanges();
      }
    }

    // Check impact assessment
    if (parsed.impact_assessment.level === 'high') {
      throw Errors.highImpactChanges(
        parsed.impact_assessment.level,
        parsed.impact_assessment.factors.num_tickets
      );
    }

    // Check for consistency in similar tickets
    const similarTickets = new Map();
    for (const change of parsed.changes) {
      const key = `${change.current_state.status}-${change.current_state.priority}`;
      if (!similarTickets.has(key)) {
        similarTickets.set(key, []);
      }
      similarTickets.get(key).push(change);
    }

    // Compare updates for similar tickets
    for (const [key, tickets] of similarTickets.entries()) {
      if (tickets.length > 1) {
        const firstUpdate = JSON.stringify(tickets[0].updates);
        for (const ticket of tickets.slice(1)) {
          if (JSON.stringify(ticket.updates) !== firstUpdate) {
            throw Errors.inconsistentChanges(
              `Similar tickets with state ${key} have inconsistent updates`
            );
          }
        }
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
  ['system', `You are a helpful AI assistant specifying exact changes for tickets.
The admin wants to: "{command}"
Here are the matching tickets: {tickets}
Specify exactly what changes should be made to each ticket.
Be consistent in how you handle similar tickets.
Consider the impact of your changes carefully.

Your response must be a JSON object with this structure:
{{
  "changes": [
    {{
      "ticket_id": "string", // Required
      "current_state": {{     // All fields optional, include only what's relevant
        "title?": "string",
        "description?": "string",
        "status?": "string",
        "priority?": "string",
        "assigned_agent_id?": "string",
        "customer?": {{
          "name?": "string",
          "email?": "string"
        }}
      }},
      "updates": {{          // At least one field must be provided
        "title?": "string",
        "description?": "string",
        "status?": "OPEN" | "IN_PROGRESS" | "WAITING" | "CLOSED",
        "priority?": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
        "assigned_agent_id?": "string"
      }},
      "explanation": "string"  // Required
    }}
  ],
  "summary": "string",      // Required
  "impact_assessment": {{   // Required
    "level": "low" | "medium" | "high",
    "factors": {{
      "num_tickets": number,    // Must be an integer
      "field_changes": number,  // Must be an integer
      "status_changes?": number,  // Must be an integer if provided
      "priority_shifts?": {{      // All numbers must be non-negative integers
        "up": number,     // How many tickets are increasing in priority
        "down": number    // How many tickets are decreasing in priority
      }},
      "assignment_changes?": number  // Must be an integer if provided
    }},
    "reasoning": "string"
  }}
}}

For example, if changing priority from HIGH to MEDIUM, you should:
1. Set priority to "MEDIUM" for each ticket
2. Provide a clear explanation for each change
3. Include an impact assessment based on number of tickets affected
4. All numbers in the impact assessment must be integers (whole numbers)
5. Priority shift numbers must be non-negative integers

Remember to follow these rules:
1. Only include fields that are relevant to the requested changes
2. Be consistent across similar tickets
3. Assess impact based on number of tickets and significance of changes
4. Use whole numbers (integers) for all numeric fields`]
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