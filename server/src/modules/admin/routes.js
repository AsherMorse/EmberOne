import express from 'express';
import { processCommand } from './controllers/ticketCommands.js';
import { validateTicketCommand } from './utils/validation.utils.js';

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

export default router;