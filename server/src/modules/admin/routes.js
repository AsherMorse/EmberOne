import express from 'express';
import { validateAdmin } from './middleware/adminAuth.js';
import { processCommand } from './controllers/ticketCommands.js';
import { validateTicketCommand } from './utils/validation.utils.js';

const router = express.Router();

// Ticket Command Routes
router.post('/tickets/command', validateAdmin, validateTicketCommand, async (req, res) => {
    try {
        const validatedCommand = await processCommand(req.body);
        res.json({
            message: 'Command validated successfully',
            command: validatedCommand
        });
    } catch (error) {
        res.status(400).json({ 
            message: 'Command validation failed',
            error: error.message 
        });
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