/** Landing page with entry input and recent entries display */

'use client';

import type { ReactElement } from 'react';

import EntryInput from '@/components/entries/EntryInput';
import { trpc } from '@/lib/trpc';

/** Renders the home page */
export default function Home(): ReactElement {
  const utils = trpc.useUtils();

  /** Handle entry submission */
  const { mutate: createEntry, isLoading } = trpc.entries.create.useMutation({
    onSuccess: () => {
      // Invalidate recent entries query to trigger refresh
      utils.entries.getRecent.invalidate();
    },
    onError: (error) => {
      console.error('Failed to create entry:', error);
    },
  });

  /** Handle entry submission */
  const handleSubmit = async (content: string): Promise<void> => {
    createEntry({ content });
  };

  return (
    <main className="min-h-screen p-8">
      {/* Page header */}
      <header className="max-w-2xl mx-auto mb-8">
        <h1 className="text-3xl font-bold mb-2">EmberOne</h1>
        <p className="text-muted-foreground">Kindling Connections, One Ticket at a Time</p>
      </header>

      {/* Entry input section */}
      <section className="max-w-2xl mx-auto">
        <EntryInput onSubmit={handleSubmit} isLoading={isLoading} />
      </section>
    </main>
  );
}
