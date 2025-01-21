import { eq, and, desc, asc, isNull } from 'drizzle-orm';
import { db } from '../../../db/index.js';
import { tickets } from '../../../db/schema/tickets.js';
import { profiles } from '../../../db/schema/profiles.js';
import { getPaginationMetadata, buildQueryParams } from '../utils/query.utils.js';

/**
 * Service layer for ticket management
 */
class TicketService {
  /**
   * List tickets with pagination and filtering
   * @param {Object} options Query options
   * @param {number} options.page Page number
   * @param {number} options.limit Items per page
   * @param {string} options.status Filter by status
   * @param {string} options.priority Filter by priority
   * @param {string} options.sort Sort field
   * @param {string} options.order Sort order
   * @param {string} options.customerId Filter by customer
   * @param {string} options.assignedAgentId Filter by assigned agent
   * @param {boolean} options.assigned Filter by assignment status
   */
  async listTickets(options) {
    // Build query parameters
    const queryParams = buildQueryParams(options, tickets);

    // Get total count for pagination
    const totalItems = await db.select({ count: tickets.id })
      .from(tickets)
      .where(queryParams.where)
      .then(result => result.length);

    // Get pagination metadata with total
    const { pagination } = getPaginationMetadata(options, totalItems);

    // Get tickets
    const results = await db.select()
      .from(tickets)
      .where(queryParams.where)
      .orderBy(queryParams.orderBy)
      .limit(queryParams.limit)
      .offset(queryParams.offset);

    return {
      tickets: results,
      pagination
    };
  }

  /**
   * Get a single ticket by ID
   * @param {string} id Ticket ID
   */
  async getTicket(id) {
    const ticket = await db.select().from(tickets)
      .where(eq(tickets.id, id))
      .limit(1)
      .then(results => results[0]);

    if (!ticket) {
      throw new Error('Ticket not found');
    }

    return ticket;
  }

  /**
   * Create a new ticket
   * @param {Object} data Ticket data
   * @param {string} customerId Customer creating the ticket
   */
  async createTicket(data, customerId) {
    const { title, description, priority } = data;

    const ticket = await db.insert(tickets)
      .values({
        title,
        description,
        priority,
        customerId
      })
      .returning();

    return ticket[0];
  }

  /**
   * Update a ticket
   * @param {string} id Ticket ID
   * @param {Object} data Update data
   */
  async updateTicket(id, data) {
    const updated = await db.update(tickets)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(tickets.id, id))
      .returning();

    if (!updated[0]) {
      throw new Error('Ticket not found');
    }

    return updated[0];
  }

  /**
   * Verify agent exists
   * @param {string} agentId Agent ID to verify
   */
  async verifyAgent(agentId) {
    const agent = await db.select().from(profiles)
      .where(and(
        eq(profiles.id, agentId),
        eq(profiles.role, 'AGENT')
      ))
      .limit(1)
      .then(results => results[0]);

    if (!agent) {
      throw new Error('Invalid agent ID');
    }

    return agent;
  }
}

export const ticketService = new TicketService(); 