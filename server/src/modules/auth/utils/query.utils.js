import { db } from '../../../db/index.js';
import { profiles } from '../../../db/schema/profiles.js';
import { eq } from 'drizzle-orm';

/**
 * Common profile selector
 */
export const profileSelector = {
  id: profiles.id,
  userId: profiles.userId,
  email: profiles.email,
  fullName: profiles.fullName,
  role: profiles.role,
  createdAt: profiles.createdAt,
  updatedAt: profiles.updatedAt
};

/**
 * Create base query for profiles
 */
export const createBaseQuery = () => {
  return db.select(profileSelector).from(profiles);
};

/**
 * Apply filters to profile query
 */
export const applyFilters = (query, filters = {}) => {
  let filteredQuery = query;

  if (filters.userId) {
    filteredQuery = filteredQuery.where(eq(profiles.userId, filters.userId));
  }
  if (filters.role) {
    filteredQuery = filteredQuery.where(eq(profiles.role, filters.role.toUpperCase()));
  }
  if (filters.email) {
    filteredQuery = filteredQuery.where(eq(profiles.email, filters.email));
  }

  return filteredQuery;
}; 