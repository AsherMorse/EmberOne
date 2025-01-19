/** Landing page with entry input and recent entries display */

'use client';

import type { ReactElement } from 'react';

import EntriesList from '@/components/entries/EntriesList';
import EntryInput from '@/components/entries/EntryInput';
import { trpc } from '@/lib/trpc';

/** Rate limit for entry submissions in milliseconds */
const RATE_LIMIT = 5000; // 5 seconds

/** Renders the home page */
export default function Home(): ReactElement {
  const utils = trpc.useContext();

  /** Handle entry submission */
  const { mutate: createEntry, isLoading: isSubmitting } = trpc.entries.create.useMutation({
    onSuccess: () => {
      // Invalidate recent entries query to trigger refresh
      utils.entries.getRecent.invalidate();
    },
    onError: (error) => {
      console.error('Failed to create entry:', error);
    },
  });

  /** Query recent entries */
  const {
    data: entriesData,
    isLoading: isLoadingEntries,
    error: entriesError,
  } = trpc.entries.getRecent.useQuery({ limit: 5, offset: 0 });

  /** Handle entry submission */
  const handleSubmit = async (content: string): Promise<void> => {
    createEntry({ content });
  };

  return (
    <main className="min-h-screen p-8">
      {/* Page header */}
      <header className="max-w-2xl mx-auto mb-8">
        <h1 className="text-3xl font-bold mb-2">EmberOne</h1>
        <p className="text-muted-foreground">Share your thoughts with the world.</p>
      </header>

      {/* Entry input section */}
      <section className="max-w-2xl mx-auto mb-8">
        <EntryInput
          onSubmit={handleSubmit}
          isLoading={isSubmitting}
          successMessage="Entry submitted successfully!"
          rateLimit={RATE_LIMIT}
        />
      </section>

      {/* Recent entries section */}
      <section className="max-w-2xl mx-auto">
        <h2 className="text-xl font-semibold mb-4">Recent Entries</h2>
        <EntriesList
          entries={entriesData?.data ?? []}
          isLoading={isLoadingEntries}
          error={entriesError?.message || entriesData?.error || undefined}
        />
      </section>
    </main>
  );
}
