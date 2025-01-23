import { db } from '../../../db/index.js';
import { comments } from '../../../db/schema/comments.js';
import { profiles } from '../../../db/schema/profiles.js';
import { eq, and, desc } from 'drizzle-orm';

/**
 * Common comment selector with author info
 */
export const commentSelector = {
  id: comments.id,
  ticketId: comments.ticketId,
  authorId: comments.authorId,
  content: comments.content,
  type: comments.type,
  isInternal: comments.isInternal,
  metadata: comments.metadata,
  createdAt: comments.createdAt,
  updatedAt: comments.updatedAt,
  author: {
    id: profiles.id,
    fullName: profiles.fullName,
    email: profiles.email,
    role: profiles.role
  }
};

/**
 * Create a base query for comments with author information
 */
export function createBaseCommentQuery() {
  return db
    .select(commentSelector)
    .from(comments)
    .leftJoin(profiles, eq(comments.authorId, profiles.id))
    .orderBy(desc(comments.createdAt)); // Most recent comments first
}

/**
 * Add filters to a comment query
 * @param {Object} query - The base query to add filters to
 * @param {Object} filters - The filters to apply
 * @param {string} filters.ticketId - Filter by ticket ID
 * @param {boolean} filters.includeInternal - Whether to include internal comments
 * @returns {Object} Query with filters applied
 */
export function addCommentFilters(query, filters) {
  const conditions = [];

  // Filter by ticket ID
  if (filters.ticketId) {
    conditions.push(eq(comments.ticketId, filters.ticketId));
  }

  // Filter internal comments if not explicitly included
  if (!filters.includeInternal) {
    conditions.push(eq(comments.isInternal, false));
  }

  // Apply all conditions together
  if (conditions.length > 0) {
    return query.where(and(...conditions));
  }

  return query;
} 