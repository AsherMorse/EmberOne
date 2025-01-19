import { TRPCError } from '@trpc/server';

import { createEntry, getRecentEntries, getUserEntries } from '@/db/operations';
import { emitter, NEW_ENTRY_EVENT } from '@/lib/events/entries';
import {
  createEntrySchema,
  getRecentEntriesSchema,
  getUserEntriesSchema,
} from '@/server/schemas/entry';
import { protectedProcedure, router } from '@/server/trpc';

/** Rate limit window in milliseconds */
const RATE_LIMIT_WINDOW = 5000; // 5 seconds

/** Rate limit state */
const rateLimitState = new Map<string, number>();

/** Entry router with CRUD operations and real-time updates */
export const entriesRouter = router({
  /** Create a new entry */
  create: protectedProcedure.input(createEntrySchema).mutation(async ({ ctx, input }) => {
    // Check rate limit
    const now = Date.now();
    const lastSubmitTime = rateLimitState.get(ctx.user.id) || 0;
    const timeSinceLastSubmit = now - lastSubmitTime;

    if (timeSinceLastSubmit < RATE_LIMIT_WINDOW) {
      const remaining = Math.ceil((RATE_LIMIT_WINDOW - timeSinceLastSubmit) / 1000);
      throw new TRPCError({
        code: 'TOO_MANY_REQUESTS',
        message: `Please wait ${remaining} seconds before submitting again`,
      });
    }

    const result = await createEntry({
      content: input.content,
      user_id: ctx.user.id,
    });

    if (result.data) {
      // Emit new entry event for SSE
      emitter.emit(NEW_ENTRY_EVENT, result.data);
      rateLimitState.set(ctx.user.id, now);
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
});
