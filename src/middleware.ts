import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { supabase } from '@/lib/supabase';

/** Middleware to handle protected routes */
export async function middleware(req: NextRequest): Promise<NextResponse> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const path = req.nextUrl.pathname;

  // Auth pages redirect to home if logged in
  if ((path === '/login' || path === '/signup') && session) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  // Protected routes redirect to login if not logged in
  if (!session && path !== '/login' && path !== '/signup') {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.next();
}

/** Paths that trigger the middleware */
export const config = {
  matcher: [
    // Match all paths except static files, images, and api routes
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
