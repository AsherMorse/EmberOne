import { db } from '../../../db/index.js';
import { tickets } from '../../../db/schema/tickets.js';
import { profiles } from '../../../db/schema/profiles.js';
import { history } from '../../../db/schema/history.js';
import { eq, and, count } from 'drizzle-orm';
import { 
  createBaseQuery, 
  applySorting, 
  applyPagination,
  applyAllFilters
} from '../utils/query.utils.js';

/**
 * Service class for handling ticket-related operations
 */
class TicketService {
  /**
   * List tickets with filtering
   */
  async listTickets(profileId, role, options = {}) {
    // Build query with filters
    let query = createBaseQuery();
    
    // Apply all filters including role-based access and search/status/priority
    query = applyAllFilters(query, profileId, role, options);
    
    // Apply sorting
    query = applySorting(query, {
      sortBy: options.sortBy,
      sortOrder: options.sortOrder
    });

    // Get total count with filters (but before pagination)
    let totalQuery = db.select({ count: count(tickets.id) }).from(tickets);
    totalQuery = applyAllFilters(totalQuery, profileId, role, options);
    const [{ count: total }] = await totalQuery;

    // Get paginated results
    const results = await applyPagination(query, {
      page: options.page,
      limit: options.limit
    });

    return {
      tickets: results,
      pagination: {
        total: Number(total),
        page: options.page || 1,
        limit: options.limit || 10,
        pages: Math.ceil(total / (options.limit || 10))
      }
    };
  }

  /**
   * Create a new ticket
   */
  async createTicket(customerId, ticketData) {
    const [ticket] = await db
      .insert(tickets)
      .values({
        ...ticketData,
        customerId,
        status: 'OPEN',
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();

    return this.getTicket(ticket.id);
  }

  /**
   * Get a single ticket by ID
   */
  async getTicket(ticketId) {
    const query = createBaseQuery().where(eq(tickets.id, ticketId));
    const [ticket] = await query;

    if (!ticket) {
      throw new Error('Ticket not found');
    }

    return ticket;
  }

  /**
   * Update a ticket
   */
  async updateTicket(ticketId, updates, profileId, role) {
    const updateData = {
      ...updates,
      updatedAt: new Date()
    };

    // Handle closed status
    if (updates.status === 'CLOSED') {
      updateData.closedAt = new Date();
    } else if (updates.status && updates.status !== 'CLOSED') {
      updateData.closedAt = null;
    }

    // Handle feedback updates
    if (updates.feedbackRating !== undefined || updates.feedbackText !== undefined) {
      // Verify ticket is closed and user is the customer
      const ticket = await this.getTicket(ticketId);
      if (ticket.status !== 'CLOSED') {
        throw new Error('Feedback can only be provided for closed tickets');
      }
      if (role === 'CUSTOMER' && ticket.customerId !== profileId) {
        throw new Error('Only the ticket owner can provide feedback');
      }
    }

    const [updatedTicket] = await db
      .update(tickets)
      .set(updateData)
      .where(eq(tickets.id, ticketId))
      .returning();

    // Remove history tracking for feedback
    // if (updates.feedbackRating !== undefined || updates.feedbackText !== undefined) {
    //   await this.addHistory(ticketId, profileId, 'feedback_added', null, {
    //     feedbackRating: updates.feedbackRating,
    //     feedbackText: updates.feedbackText
    //   });
    // }

    return this.getTicket(updatedTicket.id);
  }

  /**
   * Add a history entry for a ticket
   */
  async addHistory(ticketId, actorId, action, oldValue, newValue, metadata = {}) {
    const [history] = await db
      .insert(history)
      .values({
        ticketId,
        actorId,
        action,
        oldValue,
        newValue,
        metadata,
        createdAt: new Date()
      })
      .returning();

    return history;
  }

  /**
   * Assign a ticket to an agent
   */
  async assignTicket(ticketId, agentId) {
    // Verify agent exists and is an agent
    const [agent] = await db
      .select()
      .from(profiles)
      .where(and(
        eq(profiles.id, agentId),
        eq(profiles.role, 'AGENT')
      ));

    if (!agent) {
      throw new Error('Agent not found');
    }

    return this.updateTicket(ticketId, { assignedAgentId: agentId });
  }

  /**
   * Check if a user has access to a ticket
   */
  async hasAccess(ticketId, userId, role) {
    // Apply role-based access conditions
    if (role === 'AGENT') {
      // Agents can access all tickets
      return true;
    }

    // For customers, check if they own the ticket
    const conditions = [eq(tickets.id, ticketId)];
    if (role === 'CUSTOMER') {
      conditions.push(eq(tickets.customerId, userId));
    }

    const query = db
      .select({ id: tickets.id })
      .from(tickets)
      .where(and(...conditions));

    const [ticket] = await query;
    return Boolean(ticket);
  }
}

export const ticketService = new TicketService(); 