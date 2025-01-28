/**
 * Controller for handling admin ticket commands
 * Provides functionality for natural language to query conversion
 */

import { Errors } from '../../ai/utils/errors.js';
import { queryGenerationChain } from '../../ai/chains/queryGeneration.js';
import { changeGenerationChain } from '../../ai/chains/changeGeneration.js';
import { Client } from 'langsmith';
import { ticketService } from '../../tickets/services/ticket.service.js';
import { sseService } from '../services/sse.service.js';
import { v4 as uuid } from 'uuid';
import { CommandTimer } from '../utils/commandTimer.js';
import { logger } from '../../../utils/logger.js';

// Initialize LangSmith client
const client = new Client({
    apiUrl: process.env.LANGSMITH_API_URL,
    apiKey: process.env.LANGSMITH_API_KEY
});

/**
 * Process a ticket command and emit progress events
 * @param {Object} commandData Command data from request
 * @returns {Promise<Object>} Command result
 */
export async function processCommand(commandData) {
    const commandId = uuid();
    const timer = new CommandTimer(commandId, commandData.text);

    try {
        // Start command processing
        logger.info(`Starting command processing: ${commandId}`);
        
        // Broadcast command start
        sseService.broadcast('command_start', {
            commandId,
            command: commandData.text,
            startTime: Date.now()
        });
        
        const result = await processCommandStages(commandData, timer);
        
        // Mark command as complete
        await timer.complete(result);
        return result;
    } catch (error) {
        // Handle command failure
        logger.error(`Command processing failed: ${commandId}`, error);
        await timer.fail(error);
        throw error;
    }
}

/**
 * Process command through various stages
 * @private
 */
async function processCommandStages(commandData, timer) {
    try {
        // Validate command text
        if (!commandData.text) {
            throw Errors.invalidCommand('Command text is required');
        }

        // Stage 1: Understanding command
        timer.startStage(1);
        logger.debug(`Stage 1: Understanding command ${timer.commandId}`);
        // Add a small delay to simulate understanding
        await new Promise(resolve => setTimeout(resolve, 100));
        timer.endStage();

        // Stage 2: Converting to query
        timer.startStage(2);
        logger.debug(`Stage 2: Converting to query ${timer.commandId}`);
        const queryResult = await queryGenerationChain.invoke({
            command: commandData.text,
            current_date: new Date().toISOString()
        }, {
            callbacks: [{
                handleChainEnd: async (outputs) => {
                    await client.createRun({
                        name: "Query Generation",
                        run_type: "chain",
                        inputs: { command: commandData.text },
                        outputs: outputs,
                        tags: ["ticket_command", "query_generation"]
                    });
                }
            }]
        });

        if (!queryResult || !queryResult.query) {
            throw Errors.invalidCommand('Failed to generate query from command');
        }
        timer.endStage();

        // Stage 3: Finding tickets
        timer.startStage(3);
        logger.debug(`Stage 3: Finding tickets ${timer.commandId}`);
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

        // Update ticket count for timing estimates
        await timer.initializeEstimates(tickets.tickets?.length || 0);
        timer.endStage();

        // Check if we found any tickets
        if (!tickets.tickets || tickets.tickets.length === 0) {
            timer.startStage(6); // Skip to final stage
            const result = {
                query: queryResult.query,
                explanation: 'No tickets found matching the criteria',
                tickets: [],
                matchCount: 0,
                suggestedChanges: {
                    changes: [],
                    summary: 'No tickets found to update',
                    impact_assessment: {
                        level: 'low',
                        factors: {
                            num_tickets: 0,
                            field_changes: 0
                        },
                        reasoning: 'No tickets matched the search criteria'
                    }
                }
            };
            timer.endStage();
            return result;
        }

        // Stage 4: Analyzing tickets
        timer.startStage(4);
        logger.debug(`Stage 4: Analyzing tickets ${timer.commandId}`);
        // Add a small delay to simulate analysis
        await new Promise(resolve => setTimeout(resolve, 100));
        timer.endStage();

        // Stage 5: Preparing changes
        timer.startStage(5);
        logger.debug(`Stage 5: Preparing changes ${timer.commandId}`);
        const changeResult = await changeGenerationChain.invoke({
            command: commandData.text,
            tickets: JSON.stringify(tickets.tickets)
        }, {
            callbacks: [{
                handleChainEnd: async (outputs) => {
                    await client.createRun({
                        name: "Change Generation",
                        run_type: "chain",
                        inputs: { 
                            command: commandData.text,
                            tickets: tickets.tickets 
                        },
                        outputs: outputs,
                        tags: ["ticket_command", "change_generation"]
                    });
                }
            }]
        });
        timer.endStage();

        // Stage 6: Ready for review
        timer.startStage(6);
        logger.debug(`Stage 6: Ready for review ${timer.commandId}`);
        
        // Prepare the result
        const result = {
            ...queryResult,
            tickets: tickets.tickets,
            matchCount: tickets.tickets.length,
            suggestedChanges: changeResult
        };
        
        timer.endStage();
        return result;
    } catch (error) {
        if (error.code) {
            throw error; // Pass through AIErrors
        }
        throw Errors.invalidCommand(error.message || 'Failed to process command');
    }
}

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