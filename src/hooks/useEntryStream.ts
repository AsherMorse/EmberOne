import { useEffect, useRef } from 'react';

import type { Entry } from '@/types/database';

/** Hook for subscribing to entry updates via SSE */
export function useEntryStream(
  onNewEntry: (entry: Pick<Entry, 'id' | 'content' | 'created_at'>) => void
): void {
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

    // Handle incoming messages
    eventSource.onmessage = (event: MessageEvent): void => {
      const data = JSON.parse(event.data);

      if (data.type === 'entry') {
        onNewEntry(data.data);
      }
    };

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
