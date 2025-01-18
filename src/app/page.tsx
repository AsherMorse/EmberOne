import type { ReactElement } from 'react';

export default function Home(): ReactElement {
  const message = 'Hello World';

  return (
    <div className="min-h-screen flex items-center justify-center">
      <h1 className="text-4xl font-bold" style={{ color: 'var(--accent)' }}>
        {message}
      </h1>
    </div>
  );
}
