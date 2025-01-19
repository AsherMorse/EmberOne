import { createServerClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { type NextRequest, type NextResponse } from 'next/server';

/** Create a Supabase client for server-side operations */
export function createClient(req: NextRequest, res: NextResponse): SupabaseClient {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL');
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => Array.from(req.cookies.getAll()).map(({ name, value }) => ({ name, value })),
        setAll: (cookies) => cookies.forEach((cookie) => res.cookies.set(cookie)),
      },
    }
  );
}
