import { db } from '../../../db/index.js';
import { comments } from '../../../db/schema/comments.js';
import { profiles } from '../../../db/schema/profiles.js';

/**
 * Create a base query for comments with author information
 */
export function createBaseCommentQuery() {
  // TODO: Implement base query
  // Should join with profiles to get author information
  return db.select().from(comments);
}

/**
 * Add filters to a comment query
 * @param {Object} query - The base query to add filters to
 * @param {Object} filters - The filters to apply
 * @param {string} filters.ticketId - Filter by ticket ID
 * @param {boolean} filters.includeInternal - Whether to include internal comments
 */
export function addCommentFilters(query, filters) {
  // TODO: Implement filters
  // - Filter by ticket ID
  // - Filter internal comments based on user role
  return query;
} 