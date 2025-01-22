import { db } from '../../../db/index.js';
import { tickets } from '../../../db/schema/tickets.js';
import { profiles } from '../../../db/schema/profiles.js';
import { eq, and, count } from 'drizzle-orm';
import { 
  createBaseQuery, 
  applySorting, 
  applyPagination,
  applyAccessFilters 
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
    query = applyAccessFilters(query, profileId, role, { onlyAssigned: options.onlyAssigned });
    query = applySorting(query, options);

    // Get total count
    let totalQuery = db.select({ count: count(tickets.id) }).from(tickets);
    totalQuery = applyAccessFilters(totalQuery, profileId, role, { onlyAssigned: options.onlyAssigned });
    const [{ count: total }] = await totalQuery;

    // Get paginated results
    const results = await applyPagination(query, options);

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
  async updateTicket(ticketId, updates) {
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

    const [updatedTicket] = await db
      .update(tickets)
      .set(updateData)
      .where(eq(tickets.id, ticketId))
      .returning();

    return this.getTicket(updatedTicket.id);
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
    const query = db
      .select({ id: tickets.id })
      .from(tickets)
      .where(eq(tickets.id, ticketId));

    const filteredQuery = applyAccessFilters(query, userId, role);
    const [ticket] = await filteredQuery;

    return Boolean(ticket);
  }
}

export const ticketService = new TicketService(); 