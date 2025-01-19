'use client';

import { trpc } from '@/lib/trpc';
import type { Entry } from '@/types/database';

/** Hook to subscribe to new entries */
export function useEntrySubscription(
  onNewEntry: (entry: Pick<Entry, 'id' | 'content' | 'created_at'>) => void
): void {
  trpc.entries.onEntryUpdate.useSubscription(undefined, {
    onData: (data: { type: 'created'; data: Pick<Entry, 'id' | 'content' | 'created_at'> }) => {
      if (data.type === 'created') {
        onNewEntry(data.data);
      }
    },
    onError: (err) => {
      console.error('Subscription error:', err);
    },
  });
}
