import express from 'express';
import { processCommand } from './controllers/ticketCommands.js';
import { validateTicketCommand } from './utils/validation.utils.js';
import { ticketService } from '../tickets/services/ticket.service.js';
import { Errors } from '../ai/utils/errors.js';
import { sseService } from './services/sse.service.js';
import { v4 as uuid } from 'uuid';
import { commandTimingsService } from './services/commandTimings.service.js';
import { CommandTimer } from './utils/commandTimer.js';
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
            // Get actual average durations
            const averageDurations = await commandTimingsService.getAverageStageDurations();
            logger.debug('Using average durations for simulation:', { averageDurations });
            
            // Initialize with 5 tickets for timing estimates
            await timer.initializeEstimates(5);
            
            // Small delay to ensure UI is ready
            await new Promise(resolve => setTimeout(resolve, 100));

            for (let stage = 1; stage <= 6; stage++) {
                // Start timing the stage
                timer.startStage(stage);
                
                // Get the actual average duration for this stage
                const stageDuration = averageDurations[`stage_${stage}`];
                logger.debug(`Simulating stage ${stage} with duration:`, { stageDuration });
                
                // Calculate increment size based on duration
                // For stages < 1s: 10% increments
                // For stages < 3s: 5% increments
                // For stages < 5s: 2% increments
                // For stages >= 5s: 1% increments
                let incrementPercent;
                if (stageDuration < 1000) {
                    incrementPercent = 10;
                } else if (stageDuration < 3000) {
                    incrementPercent = 5;
                } else if (stageDuration < 5000) {
                    incrementPercent = 2;
                } else {
                    incrementPercent = 1;
                }
                
                const incrementCount = Math.floor(100 / incrementPercent);
                const incrementDuration = Math.floor(stageDuration / incrementCount);
                
                logger.debug(`Stage ${stage} progress config:`, {
                    stageDuration,
                    incrementPercent,
                    incrementCount,
                    incrementDuration
                });
                
                // Simulate stage work with dynamic increments
                for (let i = 0; i < incrementCount; i++) {
                    await new Promise(resolve => setTimeout(resolve, incrementDuration));
                    timer.emitProgress(); // Force a progress update
                }
                
                // End timing for this stage and wait a bit
                timer.endStage();
                await new Promise(resolve => setTimeout(resolve, 100));
            }

            // Complete the command with timing data
            await timer.complete({
                matchCount: 5,
                suggestedChanges: {
                    changes: new Array(3).fill({}) // Simulate 3 changes
                }
            }, false); // Don't save test timing data

        } catch (error) {
            logger.error('Error in test command:', error);
            await timer.fail(error, false); // Don't save test timing data
        }
    };

    // Start simulation
    simulateStage().catch(error => {
        logger.error('Error in test command:', error);
        timer.fail(error, false).catch(err => { // Don't save test timing data
            logger.error('Error in error handling:', err);
        });
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

/**
 * Get average stage durations
 */
router.get('/command-timings/averages', async (req, res) => {
    try {
        const averages = await commandTimingsService.getAverageStageDurations();
        res.json(averages);
    } catch (error) {
        logger.error('Failed to get average stage durations', { error });
        res.status(500).json({ error: 'Failed to get average stage durations' });
    }
});

export default router;