import { z } from 'zod';

/** Schema for creating a new entry */
export const createEntrySchema = z.object({
  content: z
    .string()
    .min(1, 'Content cannot be empty')
    .max(1000, 'Content cannot exceed 1000 characters'),
});

/** Schema for paginated queries */
export const paginationSchema = z.object({
  limit: z
    .number()
    .int('Limit must be an integer')
    .min(1, 'Limit must be at least 1')
    .max(100, 'Limit cannot exceed 100')
    .default(10),
  offset: z
    .number()
    .int('Offset must be an integer')
    .min(0, 'Offset cannot be negative')
    .default(0),
});

/** Schema for getting entries by user ID */
export const getUserEntriesSchema = paginationSchema.extend({
  userId: z.string().uuid('Invalid user ID'),
});

/** Schema for getting recent entries */
export const getRecentEntriesSchema = paginationSchema;
