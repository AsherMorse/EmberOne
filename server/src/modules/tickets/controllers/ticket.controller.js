import { ticketService } from '../services/ticket.service.js';

/**
 * Extract user info from request
 */
const getUserInfo = (req) => {
  const role = req.user?.user_metadata?.role?.toUpperCase() || 'CUSTOMER';
  return { role };
};

/**
 * Controller for handling ticket-related routes
 */
class TicketController {
  /**
   * List all tickets (filtered by user role)
   */
  async listTickets(req, res) {
    try {
      const { role } = getUserInfo(req);
      const { 
        page, 
        limit, 
        sortBy, 
        sortOrder, 
        onlyAssigned,
        status,
        priority,
        search
      } = req.query;

      const result = await ticketService.listTickets(req.profileId, role, {
        page: parseInt(page),
        limit: parseInt(limit),
        sortBy,
        sortOrder,
        onlyAssigned: onlyAssigned === 'true',
        status,
        priority,
        search
      });

      res.json(result);
    } catch (error) {
      console.error('List tickets error:', error);
      res.status(500).json({
        message: 'Failed to list tickets',
        code: 500
      });
    }
  }

  /**
   * Create a new ticket
   */
  async createTicket(req, res) {
    try {
      const ticket = await ticketService.createTicket(req.profileId, req.body);

      res.status(201).json({
        message: 'Ticket created successfully',
        ticket
      });
    } catch (error) {
      console.error('Create ticket error:', error);
      res.status(500).json({
        message: 'Failed to create ticket',
        code: 500
      });
    }
  }

  /**
   * Get a single ticket
   */
  async getTicket(req, res) {
    try {
      console.log('Getting ticket in controller:', { 
        id: req.params.id,
        profileId: req.profileId,
        user: req.user
      });
      
      const { role } = getUserInfo(req);
      console.log('Role:', role);
      
      const ticket = await ticketService.getTicket(req.params.id, req.profileId, role);
      console.log('Got ticket:', ticket);
      
      res.json(ticket);
    } catch (error) {
      console.error('Get ticket error:', error);
      if (error.message === 'Ticket not found') {
        return res.status(404).json({
          message: error.message,
          code: 404
        });
      }
      res.status(500).json({
        message: 'Failed to get ticket',
        code: 500
      });
    }
  }

  /**
   * Update a ticket
   */
  async updateTicket(req, res) {
    try {
      const { role } = getUserInfo(req);
      const ticket = await ticketService.updateTicket(req.params.id, req.body, req.profileId, role);

      res.json({
        message: 'Ticket updated successfully',
        ticket
      });
    } catch (error) {
      if (error.message === 'Ticket not found') {
        return res.status(404).json({
          message: error.message,
          code: 404
        });
      }

      res.status(500).json({
        message: 'Failed to update ticket',
        code: 500
      });
    }
  }

  /**
   * Assign a ticket to an agent
   */
  async assignTicket(req, res) {
    try {
      // Note: Agent validation is handled by middleware
      const ticket = await ticketService.assignTicket(req.params.id, req.body.agentId);

      res.json({
        message: 'Ticket assigned successfully',
        ticket
      });
    } catch (error) {
      if (error.message === 'Agent not found') {
        return res.status(404).json({
          message: error.message,
          code: 404
        });
      }

      res.status(500).json({
        message: 'Failed to assign ticket',
        code: 500
      });
    }
  }
}

export const ticketController = new TicketController(); 