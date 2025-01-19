import { useEffect, useRef } from 'react';

import type { EntryMessage } from '@/types/sse';
import { SSE_EVENTS } from '@/types/sse';

/** Hook for subscribing to entry updates via SSE */
export function useEntryStream(onNewEntry: (entry: EntryMessage['data']) => void): void {
  // Keep track of the EventSource instance
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    // Create new EventSource connection
    const eventSource = new EventSource('/api/entries/sse');
    eventSourceRef.current = eventSource;

    // Handle connection open
    eventSource.onopen = (): void => {
      console.log('SSE connection established');
    };

    // Handle connected event
    eventSource.addEventListener(SSE_EVENTS.CONNECTED, () => {
      console.log('SSE ready to receive entries');
    });

    // Handle entry events
    eventSource.addEventListener(SSE_EVENTS.ENTRY, (event: MessageEvent) => {
      const message = JSON.parse(event.data) as EntryMessage;
      onNewEntry(message.data);
    });

    // Handle errors
    eventSource.onerror = (error: Event): void => {
      console.error('SSE connection error:', error);
      eventSource.close();
    };

    // Clean up on unmount
    return (): void => {
      eventSource.close();
      eventSourceRef.current = null;
    };
  }, [onNewEntry]);
}
