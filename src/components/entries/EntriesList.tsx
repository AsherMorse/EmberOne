'use client';

/** List of recent entries with real-time updates */

import type { ReactElement } from 'react';

import type { Entry } from '@/types/database';

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
  entries,
  isLoading = false,
  error,
}: EntriesListProps): ReactElement {
  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-muted rounded-md p-4">
            <div className="h-4 bg-background/50 rounded w-1/4 mb-2" />
            <div className="h-4 bg-background/50 rounded w-3/4" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 p-4 rounded-md border border-red-500 bg-red-500/10">{error}</div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="text-muted-foreground text-center p-8">
        No entries yet. Be the first to share your thoughts!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {entries.map((entry) => (
        <article key={entry.id} className="bg-background border border-muted rounded-md p-4">
          <p className="text-foreground mb-2">{entry.content}</p>
          <time className="text-sm text-muted-foreground">
            {new Date(entry.created_at).toLocaleString()}
          </time>
        </article>
      ))}
    </div>
  );
}
