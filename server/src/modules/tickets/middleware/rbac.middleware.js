import { ticketService } from '../services/ticket.service.js';

/**
 * Ensure user is a customer
 */
export const requireCustomer = (req, res, next) => {
  const role = req.user?.user_metadata?.role?.toUpperCase() || 'CUSTOMER';
  
  if (role !== 'CUSTOMER') {
    return res.status(403).json({
      message: 'Only customers can perform this action',
      code: 403
    });
  }

  next();
};

/**
 * Ensure user is an agent
 */
export const requireAgent = (req, res, next) => {
  const role = req.user?.user_metadata?.role?.toUpperCase() || 'CUSTOMER';
  
  if (role !== 'AGENT') {
    return res.status(403).json({
      message: 'Only agents can perform this action',
      code: 403
    });
  }

  next();
};

/**
 * Ensure user has access to the ticket
 */
export const requireTicketAccess = async (req, res, next) => {
  const ticketId = req.params.id || req.params.ticketId;
  const role = req.user?.user_metadata?.role?.toUpperCase() || 'CUSTOMER';

  try {
    const hasAccess = await ticketService.hasAccess(ticketId, req.profileId, role);
    
    if (!hasAccess) {
      return res.status(403).json({
        message: 'Access denied',
        code: 403
      });
    }

    // Get the ticket for use in later middleware
    const ticket = await ticketService.getTicket(ticketId);
    if (!ticket) {
      return res.status(404).json({
        message: 'Ticket not found',
        code: 404
      });
    }

    // Attach the ticket to the request for use in later middleware
    req.ticket = ticket;
    next();
  } catch (error) {
    console.error('Ticket access error:', error);
    res.status(500).json({
      message: 'Error checking ticket access',
      code: 500
    });
  }
};

/**
 * Ensure user can update specific ticket fields
 */
export const validateUpdateAccess = (req, res, next) => {
  const role = req.user?.user_metadata?.role?.toUpperCase() || 'CUSTOMER';
  const updates = req.body;

  // Customers can only update title, description, priority, and feedback on closed tickets
  if (role === 'CUSTOMER') {
    const allowedFields = ['title', 'description', 'priority'];
    
    // Allow feedback fields only if ticket is closed
    if (req.ticket?.status === 'CLOSED') {
      allowedFields.push('feedbackRating', 'feedbackText');
    }

    const attemptedFields = Object.keys(updates);
    const invalidFields = attemptedFields.filter(field => !allowedFields.includes(field));

    if (invalidFields.length > 0) {
      return res.status(403).json({
        message: `Customers cannot update: ${invalidFields.join(', ')}`,
        code: 403
      });
    }
  }

  // Agents can only update status
  if (role === 'AGENT') {
    const allowedFields = ['status'];
    const attemptedFields = Object.keys(updates);
    const invalidFields = attemptedFields.filter(field => !allowedFields.includes(field));

    if (invalidFields.length > 0) {
      return res.status(403).json({
        message: `Agents can only update status. Cannot update: ${invalidFields.join(', ')}`,
        code: 403
      });
    }
  }

  next();
}; 