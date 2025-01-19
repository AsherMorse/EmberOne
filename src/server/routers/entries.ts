import { EventEmitter } from 'events';

import { observable } from '@trpc/server/observable';

import { createEntry, getRecentEntries, getUserEntries } from '@/db/operations';
import {
  createEntrySchema,
  getRecentEntriesSchema,
  getUserEntriesSchema,
} from '@/server/schemas/entry';
import { protectedProcedure, router } from '@/server/trpc';

/** Event emitter for entry updates */
const ee = new EventEmitter();

/** Entry router with CRUD operations and real-time updates */
export const entriesRouter = router({
  /** Create a new entry */
  create: protectedProcedure.input(createEntrySchema).mutation(async ({ ctx, input }) => {
    const result = await createEntry({
      content: input.content,
      user_id: ctx.user.id,
    });
    if (result.data) {
      ee.emit('entry.created', result.data);
    }
    return result;
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
    return observable<{
      type: 'created';
      data: { id: string; content: string; created_at: string };
    }>((emit) => {
      const onEntryCreated = (entry: { id: string; content: string; created_at: string }): void => {
        emit.next({ type: 'created', data: entry });
      };

      ee.on('entry.created', onEntryCreated);

      return (): void => {
        ee.off('entry.created', onEntryCreated);
      };
    });
  }),
});
