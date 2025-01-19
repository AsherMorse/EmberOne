import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { emitter, NEW_ENTRY_EVENT } from '@/lib/events/entries';
import { createClient } from '@/lib/supabase/server';
import type { Entry } from '@/types/database';

/** Handler for SSE requests */
export async function GET(req: NextRequest): Promise<Response> {
  const response = new NextResponse(
    new ReadableStream({
      start(controller): void {
        // Send initial connection message
        controller.enqueue('data: {"type":"connected"}\n\n');

        // Handle new entries
        const onNewEntry = (entry: Pick<Entry, 'id' | 'content' | 'created_at'>): void => {
          controller.enqueue(`data: ${JSON.stringify({ type: 'entry', data: entry })}\n\n`);
        };

        // Subscribe to new entry events
        emitter.on(NEW_ENTRY_EVENT, onNewEntry);

        // Clean up on close
        req.signal.addEventListener('abort', () => {
          emitter.off(NEW_ENTRY_EVENT, onNewEntry);
        });
      },
    }),
    {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
      },
    }
  );

  // Verify auth
  const supabase = createClient(req, response);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new Response('Unauthorized', { status: 401 });
  }

  return response;
}
