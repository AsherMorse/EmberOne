import { observable } from '@trpc/server/observable';

import { createEntry, getRecentEntries, getUserEntries } from '@/db/operations';
import {
  createEntrySchema,
  getRecentEntriesSchema,
  getUserEntriesSchema,
} from '@/server/schemas/entry';
import { protectedProcedure, router } from '@/server/trpc';

/** Entry router with CRUD operations and real-time updates */
export const entriesRouter = router({
  /** Create a new entry */
  create: protectedProcedure.input(createEntrySchema).mutation(async ({ ctx, input }) => {
    return createEntry({
      content: input.content,
      user_id: ctx.user.id,
    });
  }),

  /** Get recent entries with pagination */
  getRecent: protectedProcedure.input(getRecentEntriesSchema).query(async ({ input }) => {
    return getRecentEntries(input.limit, input.offset);
  }),

  /** Get user's entries with pagination */
  getUserEntries: protectedProcedure.input(getUserEntriesSchema).query(async ({ ctx, input }) => {
    return getUserEntries(ctx.user.id, input.limit, input.offset);
  }),

  /** Subscribe to entry updates */
  onEntryUpdate: protectedProcedure.subscription(() => {
    return observable<{ type: 'created'; data: { id: string } }>(() => (): (() => void) => {
      return () => {
        // Cleanup will be implemented when we add event handling
      };
    });
  }),
});
