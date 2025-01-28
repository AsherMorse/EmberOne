import express from 'express';
import { processCommand } from './controllers/ticketCommands.js';
import { validateTicketCommand } from './utils/validation.utils.js';
import { ticketService } from '../tickets/services/ticket.service.js';
import { Errors } from '../ai/utils/errors.js';
import { sseService } from './services/sse.service.js';
import { v4 as uuid } from 'uuid';
import { commandTimingsService } from './services/commandTimings.service.js';
import { CommandTimer, COMMAND_STAGES } from './utils/commandTimer.js';
import { logger } from '../../utils/logger.js';

const router = express.Router();

/**
 * @route GET /api/admin/command-updates
 * @desc SSE endpoint for real-time command execution updates
 * @access Admin only
 */
router.get('/command-updates', (req, res) => {
    const clientId = req.sessionID || uuid();
    sseService.addClient(clientId, res);
});

/**
 * @route POST /api/admin/test-command
 * @desc Test endpoint to simulate command progress with real timing data
 * @access Admin only
 */
router.post('/test-command', async (req, res) => {
    const commandId = uuid();
    const commandText = 'Test Command';
    const timer = new CommandTimer(commandId, commandText);
    
    // Send initial command start
    sseService.broadcast('command_start', {
        commandId,
        command: commandText,
        startTime: Date.now()
    });

    // Simulate command stages with real timing
    const simulateStage = async () => {
        try {
            for (let stage = 1; stage <= 6; stage++) {
                // Start timing the stage
                timer.startStage(stage);
                
                // Simulate stage work
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                // End timing for this stage
                timer.endStage();
            }

            // Complete the command and save timing data
            timer.complete({
                message: 'Test command completed successfully',
                matched_tickets_count: 5,
                num_tickets_affected: 3,
                was_accepted: true
            });

        } catch (error) {
            logger.error('Error in test command:', error);
            timer.fail(error);
        }
    };

    // Start simulation
    simulateStage().catch(error => {
        logger.error('Error in test command:', error);
        timer.fail(error);
    });

    res.json({
        message: 'Test command started',
        commandId
    });
});

/**
 * @route POST /api/admin/tickets/command
 * @desc Process a ticket command (natural language or structured)
 * @access Admin only
 */
router.post('/tickets/command', 
    validateTicketCommand,
    async (req, res) => {
        try {
            const result = await processCommand(req.body);
            res.json({
                message: result.explanation || 'Command processed successfully',
                code: 200,
                result
            });
        } catch (error) {
            // Handle AI processing errors
            if (error.name === 'AIProcessingError') {
                return res.status(400).json({
                    message: error.message,
                    code: 400,
                    error: error.error,
                    details: error.details
                });
            }
            
            res.status(500).json({ 
                message: 'Command processing failed',
                code: 500,
                error: error.message 
            });
        }
    }
);

/**
 * @route POST /api/admin/tickets/execute-changes
 * @desc Execute planned changes on multiple tickets
 * @access Admin only
 */
router.post('/tickets/execute-changes',
    async (req, res) => {
        try {
            // Extract changes from the suggestedChanges object
            const { changes } = req.body.changes ? req.body : req.body.suggestedChanges || {};
            
            if (!changes || !Array.isArray(changes)) {
                throw new Error('Changes array is required');
            }

            // Validate changes structure
            changes.forEach((change, index) => {
                if (!change.ticket_id) {
                    throw new Error(`Missing ticket_id in change at index ${index}`);
                }
                if (!change.updates || Object.keys(change.updates).length === 0) {
                    throw new Error(`No updates specified in change at index ${index}`);
                }
            });

            // Execute changes
            const result = await ticketService.executeChanges(changes, req.profileId);

            res.json({
                message: 'Changes executed successfully',
                code: 200,
                result: {
                    updatedTickets: result.updatedTickets,
                    historyCount: result.history.length,
                    summary: `Successfully updated ${result.updatedTickets.length} tickets`
                }
            });
        } catch (error) {
            console.error('Execute changes error:', error);
            
            if (error.name === 'AIProcessingError') {
                return res.status(400).json({
                    message: error.message,
                    code: 400,
                    error: error.error,
                    details: error.details
                });
            }

            res.status(500).json({
                message: 'Failed to execute changes',
                code: 500,
                error: error.message
            });
        }
    }
);

/**
 * @route GET /api/admin/command-timings
 * @desc Get historical command timing data with filtering and pagination
 * @access Admin only
 */
router.get('/command-timings', async (req, res) => {
    try {
        const { limit, offset, sortBy, sortOrder, startDate, endDate, minTickets, maxTickets } = req.query;
        
        const result = await commandTimingsService.getTimings({
            limit: limit ? parseInt(limit) : undefined,
            offset: offset ? parseInt(offset) : undefined,
            sortBy,
            sortOrder,
            filters: {
                startDate: startDate ? new Date(startDate) : undefined,
                endDate: endDate ? new Date(endDate) : undefined,
                minTickets: minTickets ? parseInt(minTickets) : undefined,
                maxTickets: maxTickets ? parseInt(maxTickets) : undefined
            }
        });

        res.json(result);
    } catch (error) {
        logger.error('Error fetching command timings:', error);
        res.status(500).json({
            message: 'Failed to fetch command timings',
            error: error.message
        });
    }
});

/**
 * @route GET /api/admin/command-timings/trends
 * @desc Get command timing performance trends
 * @access Admin only
 */
router.get('/command-timings/trends', async (req, res) => {
    try {
        const { interval, startDate, endDate } = req.query;
        
        const trends = await commandTimingsService.getPerformanceTrends({
            interval,
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined
        });

        res.json(trends);
    } catch (error) {
        logger.error('Error fetching command timing trends:', error);
        res.status(500).json({
            message: 'Failed to fetch command timing trends',
            error: error.message
        });
    }
});

export default router;