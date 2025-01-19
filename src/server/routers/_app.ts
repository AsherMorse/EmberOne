import { router } from '../trpc';

import { entriesRouter } from './entries';

/** Root router for the application */
export const appRouter = router({
  entries: entriesRouter,
});

/** Type-only export of the router type */
export type AppRouter = typeof appRouter;
