import { Router } from 'express';
import { ticketController } from './controllers/tickets.controller.js';
import { requireAuth } from '../auth/middleware/auth.middleware.js';
import {
  requireAgent,
  requireCustomer,
  verifyTicketAccess,
  handleTicketErrors
} from './middleware/auth.middleware.js';
import {
  validateCreateTicket,
  validateUpdateTicket,
  validateAssignTicket
} from './utils/validation.utils.js';

const router = Router();

// Apply auth middleware to all routes
router.use(requireAuth);

// List tickets (filtered by role)
router.get('/tickets', ticketController.listTickets);

// Create ticket (customers only)
router.post(
  '/tickets',
  requireCustomer,
  validateCreateTicket,
  ticketController.createTicket
);

// Get single ticket
router.get(
  '/tickets/:id',
  verifyTicketAccess,
  ticketController.getTicket
);

// Update ticket
router.patch(
  '/tickets/:id',
  verifyTicketAccess,
  validateUpdateTicket,
  ticketController.updateTicket
);

// Assign ticket (agents only)
router.post(
  '/tickets/:id/assign',
  requireAgent,
  verifyTicketAccess,
  validateAssignTicket,
  ticketController.assignTicket
);

// Error handler
router.use(handleTicketErrors);

export default router; 