import { router } from '../trpc';

/** Root router for the application */
export const appRouter = router({
  // Routes will be added here
});

/** Type-only export of the router type */
export type AppRouter = typeof appRouter;
