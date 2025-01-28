/**
 * Controller for handling admin ticket commands
 * Provides functionality for natural language to query conversion
 */

import { Errors } from '../../ai/utils/errors.js';
import { queryGenerationChain } from '../../ai/chains/queryGeneration.js';
import { Client } from 'langsmith';
import { ticketService } from '../../tickets/services/ticket.service.js';

// Initialize LangSmith client
const client = new Client({
    apiUrl: process.env.LANGSMITH_API_URL,
    apiKey: process.env.LANGSMITH_API_KEY
});

/**
 * Processes the natural language command request
 * @param {Object} command - The command object with text property
 * @returns {Object} The processed query with explanation and matching tickets
 * @throws {AIProcessingError} If validation fails
 */
export const processCommand = async (command) => {
    try {
        if (!command.text) {
            throw Errors.invalidCommand('Command text is required');
        }

        const result = await queryGenerationChain.invoke({
            command: command.text,
            current_date: new Date().toISOString()
        }, {
            callbacks: [{
                handleChainEnd: async (outputs) => {
                    await client.createRun({
                        name: "Query Generation",
                        run_type: "chain",
                        inputs: { command: command.text },
                        outputs: outputs,
                        tags: ["ticket_command", "query_generation"]
                    });
                }
            }]
        });

        if (!result || !result.query) {
            throw Errors.invalidCommand('Failed to generate query from command');
        }

        // Build search string from title and description filters
        const searchTerms = [];
        if (result.query.filters.title_contains) searchTerms.push(result.query.filters.title_contains);
        if (result.query.filters.description_contains) searchTerms.push(result.query.filters.description_contains);

        // Fetch matching tickets using the generated query
        const tickets = await ticketService.listTickets(null, 'ADMIN', {
            status: result.query.filters.status,
            priority: result.query.filters.priority,
            search: result.query.filters.title_contains,
            assignedAgentId: result.query.filters.assigned_agent_id,
            customerEmail: result.query.filters.customer_email_contains,
            customerName: result.query.filters.customer_name_contains,
            createdAfter: result.query.filters.created_after,
            createdBefore: result.query.filters.created_before,
            updatedAfter: result.query.filters.updated_after,
            updatedBefore: result.query.filters.updated_before,
            closedAfter: result.query.filters.closed_after,
            closedBefore: result.query.filters.closed_before,
            sortBy: result.query.sort?.field,
            sortOrder: result.query.sort?.order
        });

        return {
            ...result,
            tickets: tickets.tickets,
            matchCount: tickets.tickets.length
        };
    } catch (error) {
        if (error.code) {
            throw error; // Pass through AIErrors
        }
        throw Errors.invalidCommand(error.message || 'Failed to process command');
    }
};

/**
 * Determines command type from query result
 */
const determineCommandType = (queryResult) => {
    const filters = queryResult.query.filters;
    if (filters.status) return 'UPDATE_STATUS';
    if (filters.priority) return 'UPDATE_PRIORITY';
    if (filters.assigned_agent_id) return 'ASSIGN_AGENT';
    throw Errors.invalidCommand('Unable to determine command type from query');
};

/**
 * Extracts updates from query result
 */
const extractUpdates = (queryResult) => {
    const filters = queryResult.query.filters;
    const updates = {};
    
    if (filters.status) updates.status = filters.status;
    if (filters.priority) updates.priority = filters.priority;
    if (filters.assigned_agent_id) updates.assignedAgentId = filters.assigned_agent_id;
    
    return updates;
};

/**
 * Generates a preview of the command's effects
 */
export const generatePreview = async (command) => {
    // TODO: Implement preview generation
    throw new Error('Not implemented');
};

/**
 * Executes the validated command with transaction support
 */
export const executeCommand = async (command) => {
    // TODO: Implement command execution
    throw new Error('Not implemented');
}; 