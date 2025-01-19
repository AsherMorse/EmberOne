/** Landing page with entry input and recent entries display */

'use client';

import type { ReactElement } from 'react';

import EntryInput from '@/components/entries/EntryInput';

/** Renders the home page */
export default function Home(): ReactElement {
  /** Handle entry submission */
  const handleSubmit = async (content: string): Promise<void> => {
    // TODO: Implement entry submission with tRPC
    console.log('Submitting entry:', content);
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
        <EntryInput onSubmit={handleSubmit} />
      </section>
    </main>
  );
}
