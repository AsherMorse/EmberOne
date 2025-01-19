'use client';

/** List of recent entries with real-time updates */

import { useEffect, useState } from 'react';
import type { ReactElement } from 'react';

import { useEntryStream } from '@/hooks/useEntryStream';
import type { Entry } from '@/types/database';
import type { EntryMessage } from '@/types/sse';

interface EntriesListProps {
  /** List of entries to display */
  entries: Entry[];
  /** Whether entries are loading */
  isLoading?: boolean;
  /** Error message to display */
  error?: string;
}

/** Component to display a list of entries */
export default function EntriesList({
  entries: initialEntries,
  isLoading = false,
  error,
}: EntriesListProps): ReactElement {
  // Track entries locally to merge real-time updates
  const [entries, setEntries] = useState(initialEntries);

  // Update local entries when prop changes
  useEffect(() => {
    setEntries(initialEntries);
  }, [initialEntries]);

  // Subscribe to new entries via SSE
  useEntryStream((newEntry: EntryMessage['data']) => {
    setEntries((current) => {
      // Add new entry at the start and keep only the latest 5
      const updated = [{ ...newEntry, user_id: 'system' }, ...current];
      return updated.slice(0, 5);
    });
  });

  if (isLoading) {
    return (
      /* Loading skeleton animation */
      <div className="space-y-4 animate-pulse">
        {[...Array(5)].map((_, i) => (
          /* Skeleton entry card */
          <div key={i} className="bg-muted rounded-md p-4">
            {/* Skeleton content */}
            <div className="h-14 bg-background/50 rounded w-3/4" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      /* Error message display */
      <div className="text-red-500 p-4 rounded-md border border-red-500 bg-red-500/10">{error}</div>
    );
  }

  if (entries.length === 0) {
    return (
      /* Empty state message */
      <div className="text-muted-foreground text-center p-8">
        No entries yet. Be the first to share your thoughts!
      </div>
    );
  }

  return (
    /* Entries list container */
    <div className="space-y-4">
      {entries.map((entry) => (
        /* Entry card */
        <article key={entry.id} className="bg-background border border-muted rounded-md p-4">
          {/* Entry content */}
          <p className="text-foreground mb-2">{entry.content}</p>
          {/* Entry timestamp */}
          <time className="text-sm text-muted-foreground">
            {new Date(entry.created_at).toLocaleString()}
          </time>
        </article>
      ))}
    </div>
  );
}
