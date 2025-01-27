/**
 * Admin Command Chain
 * Handles validation and processing of admin ticket commands.
 * @module ai/chains/adminCommands
 */

import { z } from 'zod';
import { ChatPromptTemplate } from 'langchain/prompts';
import { RunnableSequence } from 'langchain/runnables';
import { gpt4oMini } from '../config.js';
import { Errors } from '../utils/errors.js';

/**
 * Schema for ticket filter criteria
 */
const TicketFilterSchema = z.object({
    status: z.enum(['OPEN', 'IN_PROGRESS', 'WAITING', 'CLOSED']).optional(),
    priority: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']).optional(),
    assignedAgentId: z.string().optional()
});

/**
 * Schema for ticket updates
 */
const TicketUpdateSchema = z.object({
    status: z.enum(['OPEN', 'IN_PROGRESS', 'WAITING', 'CLOSED']).optional(),
    priority: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']).optional(),
    assignedAgentId: z.string().optional()
});

/**
 * Schema for admin command
 */
const AdminCommandSchema = z.object({
    type: z.enum(['UPDATE_STATUS', 'UPDATE_PRIORITY', 'ASSIGN_AGENT']),
    filters: TicketFilterSchema,
    updates: TicketUpdateSchema,
    reason: z.string().optional()
});

/**
 * Schema for command validation output
 */
const CommandValidationSchema = z.object({
    command: AdminCommandSchema,
    validation: z.object({
        isValid: z.boolean(),
        issues: z.array(z.string()).optional(),
        suggestions: z.array(z.string()).optional()
    }),
    explanation: z.string()
});

/**
 * Validates the command against business rules
 * @throws {AIProcessingError} If validation fails
 */
const validateCommand = (result) => {
    try {
        const parsed = CommandValidationSchema.parse(result);
        
        // Ensure command is valid
        if (!parsed.validation.isValid) {
            throw Errors.invalidCommand(
                parsed.validation.issues?.join(', ') || 'Invalid command'
            );
        }

        // Validate command type matches updates
        const { type, updates } = parsed.command;
        switch (type) {
            case 'UPDATE_STATUS':
                if (!updates.status) {
                    throw Errors.invalidCommand('Status update required for UPDATE_STATUS command');
                }
                break;
            case 'UPDATE_PRIORITY':
                if (!updates.priority) {
                    throw Errors.invalidCommand('Priority update required for UPDATE_PRIORITY command');
                }
                break;
            case 'ASSIGN_AGENT':
                if (!updates.assignedAgentId) {
                    throw Errors.invalidCommand('Agent ID required for ASSIGN_AGENT command');
                }
                break;
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

export {
    AdminCommandSchema,
    CommandValidationSchema,
    validateCommand
}; 