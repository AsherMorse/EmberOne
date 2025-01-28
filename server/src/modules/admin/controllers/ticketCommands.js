/**
 * Controller for handling admin ticket commands
 * Provides functionality for natural language to query conversion
 */

import { Errors } from '../../ai/utils/errors.js';
import { queryGenerationChain } from '../../ai/chains/queryGeneration.js';
import { changeGenerationChain } from '../../ai/chains/changeGeneration.js';
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

        // Generate query from command
        const queryResult = await queryGenerationChain.invoke({
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

        if (!queryResult || !queryResult.query) {
            throw Errors.invalidCommand('Failed to generate query from command');
        }

        // Build search string from title and description filters
        const searchTerms = [];
        if (queryResult.query.filters.title_contains) searchTerms.push(queryResult.query.filters.title_contains);
        if (queryResult.query.filters.description_contains) searchTerms.push(queryResult.query.filters.description_contains);

        // Fetch matching tickets using the generated query
        const tickets = await ticketService.listTickets(null, 'ADMIN', {
            status: queryResult.query.filters.status,
            priority: queryResult.query.filters.priority,
            search: queryResult.query.filters.title_contains,
            assignedAgentId: queryResult.query.filters.assigned_agent_id,
            customerEmail: queryResult.query.filters.customer_email_contains,
            customerName: queryResult.query.filters.customer_name_contains,
            createdAfter: queryResult.query.filters.created_after,
            createdBefore: queryResult.query.filters.created_before,
            updatedAfter: queryResult.query.filters.updated_after,
            updatedBefore: queryResult.query.filters.updated_before,
            closedAfter: queryResult.query.filters.closed_after,
            closedBefore: queryResult.query.filters.closed_before,
            sortBy: queryResult.query.sort?.field,
            sortOrder: queryResult.query.sort?.order
        });

        // Generate changes using the changeGenerationChain
        const changeResult = await changeGenerationChain.invoke({
            command: command.text,
            tickets: JSON.stringify(tickets.tickets)
        }, {
            callbacks: [{
                handleChainEnd: async (outputs) => {
                    await client.createRun({
                        name: "Change Generation",
                        run_type: "chain",
                        inputs: { 
                            command: command.text,
                            tickets: tickets.tickets 
                        },
                        outputs: outputs,
                        tags: ["ticket_command", "change_generation"]
                    });
                }
            }]
        });

        console.log('Generated Changes:', JSON.stringify(changeResult, null, 2));

        return {
            ...queryResult,
            tickets: tickets.tickets,
            matchCount: tickets.tickets.length,
            suggestedChanges: changeResult
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