import express from 'express';
import { validateAdmin } from './middleware/adminAuth.js';
import { processCommand } from './controllers/ticketCommands.js';
import { validateTicketCommand, validateCommandResponse } from './utils/validation.utils.js';

const router = express.Router();

// Ticket Command Routes
router.post('/tickets/command', validateAdmin, validateTicketCommand, async (req, res) => {
    try {
        const validatedCommand = await processCommand(req.body);
        
        // Validate and format the response
        const response = validateCommandResponse({
            message: 'Command validated successfully',
            command: validatedCommand
        });
        
        res.json(response);
    } catch (error) {
        // Handle response validation errors separately
        if (error.message.includes('Response must')) {
            console.error('Response validation error:', error);
            res.status(500).json({
                message: 'Internal server error',
                code: 500,
                error: 'Failed to format response'
            });
        } else {
            res.status(400).json({ 
                message: 'Command validation failed',
                code: 400,
                error: error.message 
            });
        }
    }
});

router.post('/tickets/command/preview', validateAdmin, async (req, res) => {
    try {
        // TODO: Implement preview generation
        res.status(501).json({ error: 'Not implemented' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/tickets/command/execute', validateAdmin, async (req, res) => {
    try {
        // TODO: Implement command execution with transaction support
        res.status(501).json({ error: 'Not implemented' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router; 