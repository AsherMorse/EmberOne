import express from 'express';
import { processCommand } from './controllers/ticketCommands.js';
import { validateTicketCommand } from './utils/validation.utils.js';
import { ticketService } from '../tickets/services/ticket.service.js';
import { Errors } from '../ai/utils/errors.js';

const router = express.Router();

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

export default router;