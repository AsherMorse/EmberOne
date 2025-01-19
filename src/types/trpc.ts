import { type User } from '@supabase/supabase-js';
import { type NextRequest, type NextResponse } from 'next/server';

/** Context interface with user and request info */
export interface Context {
  user: User | null;
  req: NextRequest;
  res: NextResponse;
}

/** Options for creating context */
export interface CreateContextOptions {
  req: NextRequest;
  res: NextResponse;
}
