import type { ReactElement } from 'react';

export default function Home(): ReactElement {
  const message = 'Hello World';

  return (
    <div>
      <h1>{message}</h1>
    </div>
  );
}
