import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { type NextRequest, NextResponse } from 'next/server';

import { appRouter } from '@/server/routers/_app';
import { createContext } from '@/server/trpc';

/** Handle tRPC requests using Node.js runtime for full feature support */
const handler = (req: Request): Promise<Response> =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: () =>
      createContext({
        req: req as unknown as NextRequest,
        res: NextResponse.next(),
      }),
  });

export { handler as GET, handler as POST };
