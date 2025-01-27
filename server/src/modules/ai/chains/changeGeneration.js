/**
 * Change Generation Chain
 * Generates specific changes for tickets based on query results and original command.
 * Includes impact assessment and validation.
 * @module ai/chains/changeGeneration
 */

import { z } from 'zod';
import { ChatPromptTemplate } from 'langchain/prompts';
import { RunnableSequence } from 'langchain/runnables';
import { gpt4oMini } from '../config.js';
import { Errors } from '../utils/errors.js';

/**
 * Schema for ticket state representation
 */
const TicketStateSchema = z.object({
  title: z.string(),
  description: z.string(),
  status: z.string(),
  priority: z.string(),
  assigned_agent_id: z.string().optional(),
  customer: z.object({
    name: z.string(),
    email: z.string()
  })
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
});

/**
 * Schema for impact assessment
 */
const ImpactAssessmentSchema = z.object({
  level: z.enum(['low', 'medium', 'high']),
  factors: z.object({
    num_tickets: z.number(),
    field_changes: z.number(),
    status_changes: z.number(),
    priority_shifts: z.object({
      up: z.number(),
      down: z.number()
    }),
    assignment_changes: z.number()
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
      throw Errors.invalidCommand('No changes specified');
    }

    // Check for invalid state transitions
    for (const change of parsed.changes) {
      if (change.current_state.status === 'CLOSED' && 
          change.updates.status && 
          !['OPEN', 'IN_PROGRESS'].includes(change.updates.status)) {
        throw Errors.validationError(
          'status',
          'Closed tickets can only be reopened to OPEN or IN_PROGRESS status'
        );
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
Only return a JSON object matching the ChangeResponse type.
Be consistent in how you handle similar tickets.
Consider the impact of your changes carefully.`],
  ['human', '{input}']
]);

/**
 * Chain for generating specific changes for matched tickets.
 * Uses function calling to ensure type-safe outputs matching ChangeGenerationSchema.
 * @type {RunnableSequence}
 */
export const changeGenerationChain = RunnableSequence.from([
  prompt,
  gpt4oMini.bind({ 
    function_call: { name: "output" }, 
    functions: [{ name: "output", parameters: ChangeGenerationSchema.shape }] 
  }),
  (response) => response.function_call.arguments,
  validateChanges
]); 