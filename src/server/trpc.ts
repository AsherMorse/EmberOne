import { initTRPC, TRPCError } from '@trpc/server';
import { NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';
import { type Context, type CreateContextOptions } from '@/types/trpc';

/** Inner context creation with user and request */
const createInnerContext = (opts: Context): Context => {
  return {
    user: opts.user,
    req: opts.req,
    res: opts.res,
  };
};

/** Create context for incoming requests */
export const createContext = async (opts: CreateContextOptions): Promise<Context> => {
  const res = NextResponse.next();
  const supabase = createClient(opts.req, res);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return createInnerContext({
    user,
    req: opts.req,
    res,
  });
};

/** Initialize tRPC */
const t = initTRPC.context<typeof createContext>().create();

/** Base router and procedure helpers */
export const router = t.router;
export const publicProcedure = t.procedure;

/** Middleware to check if user is authenticated */
const isAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({
    ctx: {
      user: ctx.user,
    },
  });
});

/** Protected procedure helper */
export const protectedProcedure = t.procedure.use(isAuthed);
