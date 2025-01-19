import { eq, desc, sql } from 'drizzle-orm';

import type { QueryResult, Entry, NewEntry } from '@/types/database';

import { db } from './client';
import { entries } from './schema';

/** Helper to convert database entry to API type */
const toEntry = (dbEntry: unknown): Entry => {
  const entry = dbEntry as { created_at: Date } & Omit<Entry, 'created_at'>;
  return {
    ...entry,
    created_at: entry.created_at.toISOString(),
  };
};

/** Creates a new entry and returns it with error handling */
export const createEntry = async (entry: NewEntry): Promise<QueryResult<Entry | null>> => {
  try {
    const [newEntry] = await db.insert(entries).values(entry).returning();
    return { data: toEntry(newEntry), error: null };
  } catch (error) {
    console.error('Error creating entry:', error);
    return { data: null, error: 'Failed to create entry' };
  }
};

/** Gets paginated recent entries with total count */
export const getRecentEntries = async (limit = 10, offset = 0): Promise<QueryResult<Entry[]>> => {
  try {
    // Get entries with pagination
    const data = await db
      .select()
      .from(entries)
      .orderBy(desc(entries.created_at))
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    const [{ count }] = await db
      .select({
        count: sql<number>`count(*)`,
      })
      .from(entries);

    return {
      data: data.map(toEntry),
      count: Number(count),
      error: null,
    };
  } catch (error) {
    console.error('Error fetching recent entries:', error);
    return {
      data: [],
      count: 0,
      error: 'Failed to fetch entries',
    };
  }
};

/** Gets paginated entries for a specific user with total count */
export const getUserEntries = async (
  userId: string,
  limit = 10,
  offset = 0
): Promise<QueryResult<Entry[]>> => {
  try {
    // Get user's entries with pagination
    const data = await db
      .select()
      .from(entries)
      .where(eq(entries.user_id, userId))
      .orderBy(desc(entries.created_at))
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    const [{ count }] = await db
      .select({
        count: sql<number>`count(*)`,
      })
      .from(entries)
      .where(eq(entries.user_id, userId));

    return {
      data: data.map(toEntry),
      count: Number(count),
      error: null,
    };
  } catch (error) {
    console.error('Error fetching user entries:', error);
    return {
      data: [],
      count: 0,
      error: 'Failed to fetch entries',
    };
  }
};
