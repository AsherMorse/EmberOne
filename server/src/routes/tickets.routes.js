import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { validateTicketInput, validateUUIDParam, validateTicketListQuery } from '../middleware/validation.js';
import { db } from '../db/index.js';
import { tickets } from '../db/schema/tickets.js';
import { z } from 'zod';
import { eq, desc, asc, and, or, sql } from 'drizzle-orm';
import { profiles } from '../db/schema/profiles.js';

const router = express.Router();

/**
 * @route POST /tickets
 * @desc Create a new ticket
 * @access Private
 */
router.post('/', requireAuth, validateTicketInput, async (req, res) => {
  try {
    const { title, description, priority = 'MEDIUM' } = req.body;

    // Get the user's profile ID
    const [userProfile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, req.user.id))
      .limit(1);

    if (!userProfile) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    // Create ticket with validated data
    const [newTicket] = await db.insert(tickets).values({
      title,
      description,
      priority,
      status: 'OPEN', // Default status for new tickets
      customerId: userProfile.id, // Set from user's profile ID
    }).returning();

    res.status(201).json({
      message: 'Ticket created successfully',
      ticket: newTicket
    });
  } catch (error) {
    console.error('Error creating ticket:', error);
    res.status(500).json({ error: 'Failed to create ticket' });
  }
});

/**
 * @route GET /tickets
 * @desc Get all tickets (with filtering)
 * @access Private
 */
router.get('/', requireAuth, validateTicketListQuery, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      priority,
      sort = 'createdAt',
      order = 'desc'
    } = req.query;

    // Get the user's profile ID first
    const [userProfile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, req.user.id))
      .limit(1);

    if (!userProfile) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    // Build where conditions
    const conditions = [];

    // Filter by status if provided
    if (status) {
      conditions.push(eq(tickets.status, status));
    }

    // Filter by priority if provided
    if (priority) {
      conditions.push(eq(tickets.priority, priority));
    }

    // Add role-based access control
    if (req.user.user_metadata.role === 'CUSTOMER') {
      // Customers can only see their own tickets
      conditions.push(eq(tickets.customerId, userProfile.id));
    } else if (req.user.user_metadata.role === 'AGENT') {
      // Agents can see:
      // 1. Tickets assigned to them
      // 2. Any unassigned tickets
      conditions.push(
        or(
          eq(tickets.assignedAgentId, userProfile.id),
          sql`${tickets.assignedAgentId} IS NULL`,
          eq(tickets.customerId, userProfile.id)
        )
      );
    }
    // Admins can see all tickets (no additional conditions)

    // Calculate pagination
    const offset = (+page - 1) * +limit;

    // Build query with conditions
    const whereClause = conditions.length ? and(...conditions) : undefined;

    // Execute query with pagination and sorting
    const [ticketResults, totalCount] = await Promise.all([
      db.select()
        .from(tickets)
        .where(whereClause)
        .orderBy(order.toLowerCase() === 'desc' ? desc(tickets[sort]) : asc(tickets[sort]))
        .limit(+limit)
        .offset(offset),
      db.select({ count: sql`count(*)` })
        .from(tickets)
        .where(whereClause)
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount[0].count / +limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.json({
      tickets: ticketResults,
      pagination: {
        page: +page,
        limit: +limit,
        totalItems: totalCount[0].count,
        totalPages,
        hasNextPage,
        hasPrevPage
      }
    });
  } catch (error) {
    console.error('Error listing tickets:', error);
    res.status(500).json({ error: 'Failed to retrieve tickets' });
  }
});

/**
 * @route GET /tickets/:id
 * @desc Get a single ticket by ID
 * @access Private
 */
router.get('/:id', requireAuth, async (req, res) => {
  try {
    // Validate UUID format
    const ticketId = z.string().uuid().parse(req.params.id);

    // Get the user's profile first
    const [userProfile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, req.user.id))
      .limit(1);

    if (!userProfile) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    // Fetch ticket with customer and agent details
    const [ticket] = await db
      .select()
      .from(tickets)
      .where(eq(tickets.id, ticketId))
      .limit(1);

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    // Check if user has access to this ticket
    const isCustomerTicket = ticket.customerId === userProfile.id;
    const isAgent = req.user.user_metadata.role === 'AGENT' || req.user.user_metadata.role === 'ADMIN';

    if (!isCustomerTicket && !isAgent) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ ticket });
  } catch (error) {
    console.error('Error retrieving ticket:', error);

    // Handle validation errors
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Invalid ticket ID format',
        details: error.errors
      });
    }

    res.status(500).json({ error: 'Failed to retrieve ticket' });
  }
});

/**
 * @route PUT /tickets/:id
 * @desc Update a ticket
 * @access Private
 */
router.put('/:id', requireAuth, validateUUIDParam, validateTicketInput, async (req, res) => {
  try {
    // Get the user's profile ID first
    const [userProfile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, req.user.id))
      .limit(1);

    if (!userProfile) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    // Fetch existing ticket
    const [ticket] = await db
      .select()
      .from(tickets)
      .where(eq(tickets.id, req.params.id))
      .limit(1);

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    // Check permissions
    const isCustomerTicket = ticket.customerId === userProfile.id;
    const isAssignedAgent = ticket.assignedAgentId === userProfile.id;
    const isUnassignedTicket = ticket.assignedAgentId === null;
    const isAdmin = req.user.user_metadata.role === 'ADMIN';
    const isAgent = req.user.user_metadata.role === 'AGENT';

    // Validate status transitions FIRST
    if (req.body.status) {
      // Only agents and admins can change status
      if (!isAgent && !isAdmin) {
        return res.status(403).json({ error: 'Only agents can change ticket status' });
      }

      // For agents (not admins), they must be assigned to the ticket to change its status AT ALL
      if (isAgent && !isAdmin && !isAssignedAgent) {
        // Allow status change only if they're also assigning the ticket to themselves
        if (!req.body.assignedAgentId || req.body.assignedAgentId !== userProfile.id) {
          return res.status(403).json({ error: 'You must be assigned to the ticket to change its status' });
        }
      }
    }

    // Customers can only update their own tickets if not closed
    if (isCustomerTicket && ticket.status === 'CLOSED') {
      return res.status(403).json({ error: 'Cannot update closed tickets' });
    }

    // If customer is trying to update, remove status from the request body
    if (!isAgent && !isAdmin) {
      delete req.body.status;
    }

    // Agents can update tickets that are:
    // 1. Assigned to them
    // 2. Unassigned (so they can assign to themselves)
    if (isAgent && !isAssignedAgent && !isUnassignedTicket && !isAdmin) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Non-agents/admins can only update their own tickets
    if (!isAgent && !isAdmin && !isCustomerTicket) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // If assigning to an agent, validate the agent exists and is the current user (unless admin)
    if (req.body.assignedAgentId) {
      // Only agents and admins can assign tickets
      if (!isAgent && !isAdmin) {
        return res.status(403).json({ error: 'Only agents and administrators can assign tickets' });
      }

      // Check if agent exists
      const [assignedAgent] = await db
        .select()
        .from(profiles)
        .where(eq(profiles.id, req.body.assignedAgentId))
        .limit(1);

      if (!assignedAgent) {
        return res.status(400).json({ error: 'Invalid agent ID' });
      }

      // Non-admin agents can only assign tickets to themselves
      if (isAgent && !isAdmin && req.body.assignedAgentId !== userProfile.id) {
        return res.status(403).json({ error: 'Agents can only assign tickets to themselves' });
      }
    }

    // Update ticket with validated data
    const [updatedTicket] = await db
      .update(tickets)
      .set({
        ...req.body,
        updatedAt: new Date(),
        ...(req.body.status === 'CLOSED' ? { closedAt: new Date() } : {})
      })
      .where(eq(tickets.id, req.params.id))
      .returning();

    res.json({
      message: 'Ticket updated successfully',
      ticket: updatedTicket
    });
  } catch (error) {
    console.error('Error updating ticket:', error);
    res.status(500).json({ error: 'Failed to update ticket' });
  }
});

/**
 * @route DELETE /tickets/:id
 * @desc Delete a ticket
 * @access Private - Admin only
 */
router.delete('/:id', requireAuth, validateUUIDParam, async (req, res) => {
  try {
    // Fetch existing ticket first to check permissions
    const [ticket] = await db
      .select()
      .from(tickets)
      .where(eq(tickets.id, req.params.id))
      .limit(1);

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    // Only admins can delete tickets
    if (req.user.user_metadata.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Only administrators can delete tickets' });
    }

    // Delete the ticket
    await db
      .delete(tickets)
      .where(eq(tickets.id, req.params.id));

    res.json({
      message: 'Ticket deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting ticket:', error);
    res.status(500).json({ error: 'Failed to delete ticket' });
  }
});

export default router; 