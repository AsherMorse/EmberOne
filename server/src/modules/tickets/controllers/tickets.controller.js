import { ticketService } from '../services/tickets.service.js';
import { formatTicket, formatTicketList, formatTicketError } from '../utils/response.utils.js';

/**
 * Controller for handling ticket-related routes
 */
class TicketController {
  /**
   * List tickets with filtering and pagination
   * @param {import('express').Request} req - Express request object
   * @param {import('express').Response} res - Express response object
   */
  async listTickets(req, res) {
    try {
      const { role, id: userId } = req.user;
      const options = {
        ...req.query,
        // For customers, only show their tickets
        ...(role === 'CUSTOMER' && { customerId: userId })
      };

      const result = await ticketService.listTickets(options);
      res.json(formatTicketList(result));
    } catch (error) {
      console.error('List tickets error:', error);
      res.status(400).json({ message: error.message });
    }
  }

  /**
   * Get a single ticket by ID
   * @param {import('express').Request} req - Express request object
   * @param {import('express').Response} res - Express response object
   */
  async getTicket(req, res) {
    try {
      const { role, id: userId } = req.user;
      const ticket = await ticketService.getTicket(req.params.id);

      // Check access permissions
      if (role === 'CUSTOMER' && ticket.customerId !== userId) {
        return res.status(403).json({ message: 'Access denied' });
      }

      res.json(formatTicket(ticket));
    } catch (error) {
      const status = error.message === 'Ticket not found' ? 404 : 400;
      res.status(status).json({ message: error.message });
    }
  }

  /**
   * Create a new ticket
   * @param {import('express').Request} req - Express request object
   * @param {import('express').Response} res - Express response object
   */
  async createTicket(req, res) {
    try {
      const { role, id: customerId } = req.user;

      // Only customers can create tickets
      if (role !== 'CUSTOMER') {
        return res.status(403).json({ message: 'Only customers can create tickets' });
      }

      const ticket = await ticketService.createTicket(req.body, customerId);
      res.status(201).json(formatTicket(ticket));
    } catch (error) {
      console.error('Create ticket error:', error);
      res.status(400).json({ message: error.message });
    }
  }

  /**
   * Update a ticket
   * @param {import('express').Request} req - Express request object
   * @param {import('express').Response} res - Express response object
   */
  async updateTicket(req, res) {
    try {
      const { role, id: userId } = req.user;
      const ticketId = req.params.id;

      // Get existing ticket
      const ticket = await ticketService.getTicket(ticketId);

      // Check access permissions and prepare update data
      let updateData = { ...req.body };

      if (role === 'CUSTOMER') {
        // Customers can only update their own tickets
        if (ticket.customerId !== userId) {
          return res.status(403).json({ message: 'Access denied' });
        }
        // Customers can only update title, description, and priority
        const { title, description, priority } = req.body;
        updateData = { title, description, priority };
      } else if (role === 'AGENT') {
        // Agents can update status and assignment
        if (updateData.status === 'CLOSED') {
          updateData.closedAt = new Date();
        }
      }

      const updated = await ticketService.updateTicket(ticketId, updateData);
      res.json(formatTicket(updated));
    } catch (error) {
      const status = error.message === 'Ticket not found' ? 404 : 400;
      res.status(status).json({ message: error.message });
    }
  }

  /**
   * Assign a ticket to an agent
   * @param {import('express').Request} req - Express request object
   * @param {import('express').Response} res - Express response object
   */
  async assignTicket(req, res) {
    try {
      const { role, id: userId } = req.user;
      const { agentId } = req.body;

      // Only agents can assign tickets
      if (role !== 'AGENT') {
        return res.status(403).json({ message: 'Only agents can assign tickets' });
      }

      // Verify agent exists
      await ticketService.verifyAgent(agentId);

      // Update ticket assignment
      const ticket = await ticketService.updateTicket(req.params.id, {
        assignedAgentId: agentId,
        updatedAt: new Date()
      });

      res.json(formatTicket(ticket));
    } catch (error) {
      const status = error.message === 'Invalid agent ID' ? 400 : 
                    error.message === 'Ticket not found' ? 404 : 400;
      res.status(status).json({ message: error.message });
    }
  }
}

export const ticketController = new TicketController(); 