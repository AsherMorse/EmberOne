'use client';

import { createTRPCReact } from '@trpc/react-query';

import type { AppRouter } from '@/server/routers/_app';

/** tRPC client for React components */
export const trpc = createTRPCReact<AppRouter>();
