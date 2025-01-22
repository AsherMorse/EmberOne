import { Router } from 'express';
import { ticketController } from './controllers/ticket.controller.js';
import { requireAuth } from '../auth/middleware/auth.middleware.js';
import { resolveProfileId } from '../profiles/middleware/profile.middleware.js';
import { 
  validateTicketCreation, 
  validateTicketUpdate, 
  validateTicketAssignment 
} from './utils/validation.utils.js';
import {
  requireCustomer,
  requireAgent,
  requireTicketAccess,
  validateUpdateAccess
} from './middleware/rbac.middleware.js';

// TODO: Import validation middleware
// import { validateTicketInput } from './utils/validation.utils.js';

const router = Router();

// Apply auth middleware to all routes
router.use(requireAuth);

// Apply profile middleware to all routes
router.use(resolveProfileId);

/**
 * @route GET /api/tickets
 * @desc List all tickets (filtered by user role)
 * @access Private
 */
// TODO: Add validation for query parameters (pagination, filters)
router.get('/', ticketController.listTickets);

/**
 * @route POST /api/tickets
 * @desc Create a new ticket (Customers only)
 * @access Private
 */
router.post('/', 
  requireCustomer,
  validateTicketCreation, 
  ticketController.createTicket
);

/**
 * @route GET /api/tickets/:id
 * @desc Get a single ticket
 * @access Private
 */
// TODO: Add validation for ticket ID parameter
router.get('/:id', 
  requireTicketAccess, 
  ticketController.getTicket
);

/**
 * @route PATCH /api/tickets/:id
 * @desc Update a ticket (different fields based on role)
 * @access Private
 */
// TODO: Add validation for update payload based on user role
router.patch('/:id', 
  requireTicketAccess,
  validateUpdateAccess,
  validateTicketUpdate, 
  ticketController.updateTicket
);

/**
 * @route POST /api/tickets/:id/assign
 * @desc Assign a ticket to an agent (Agents only)
 * @access Private
 */
// TODO: Add validation for agent assignment
router.post('/:id/assign', 
  requireAgent,
  requireTicketAccess,
  validateTicketAssignment, 
  ticketController.assignTicket
);

export default router;
