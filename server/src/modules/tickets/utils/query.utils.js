import { db } from '../../../db/index.js';
import { tickets } from '../../../db/schema/tickets.js';
import { profiles } from '../../../db/schema/profiles.js';
import { eq, desc, asc, and, or, ilike } from 'drizzle-orm';

/**
 * Common ticket selector with customer info
 */
export const ticketSelector = {
  id: tickets.id,
  title: tickets.title,
  description: tickets.description,
  status: tickets.status,
  priority: tickets.priority,
  customerId: tickets.customerId,
  assignedAgentId: tickets.assignedAgentId,
  createdAt: tickets.createdAt,
  updatedAt: tickets.updatedAt,
  closedAt: tickets.closedAt,
  customer: {
    id: profiles.id,
    fullName: profiles.fullName,
    email: profiles.email
  }
};

/**
 * Create base query for tickets with customer info
 */
export const createBaseQuery = () => {
  return db
    .select(ticketSelector)
    .from(tickets)
    .leftJoin(profiles, eq(tickets.customerId, profiles.id));
};

/**
 * Apply access filters based on user role
 */
export const applyAccessFilters = (query, profileId, role, options = {}) => {
  // Customers can only see their own tickets
  if (role === 'CUSTOMER') {
    return query.where(eq(tickets.customerId, profileId));
  } 

  // Agents can see all tickets or only their assigned ones
  if (role === 'AGENT') {
    return options.onlyAssigned 
      ? query.where(eq(tickets.assignedAgentId, profileId))
      : query;
  }

  // Admins can see all tickets
  return query;
};

/**
 * Apply filters to a query
 */
export const applyFilters = (query, filters = {}) => {
  const conditions = [];
  const { status, priority, search } = filters;

  if (status) {
    conditions.push(eq(tickets.status, status.toUpperCase()));
  }

  if (priority) {
    conditions.push(eq(tickets.priority, priority.toUpperCase()));
  }

  if (search) {
    conditions.push(
      or(
        ilike(tickets.title, `%${search}%`),
        ilike(tickets.description, `%${search}%`)
      )
    );
  }

  if (conditions.length > 0) {
    return query.where(and(...conditions));
  }

  return query;
};

/**
 * Apply sorting to a query
 */
export const applySorting = (query, { sortBy = 'createdAt', sortOrder = 'desc' } = {}) => {
  const orderBy = sortOrder.toLowerCase() === 'asc' ? asc : desc;
  
  // Handle special cases for sorting
  switch (sortBy) {
    case 'title':
    case 'status':
    case 'priority':
    case 'createdAt':
    case 'updatedAt':
      return query.orderBy(orderBy(tickets[sortBy]));
    default:
      return query.orderBy(orderBy(tickets.createdAt));
  }
};

/**
 * Apply pagination to a query
 */
export const applyPagination = (query, { page = 1, limit = 10 } = {}) => {
  const offset = (page - 1) * limit;
  return query.limit(limit).offset(offset);
};