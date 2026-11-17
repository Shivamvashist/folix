'use client';

import { useEffect } from 'react';

import { Button } from '@/components/ui/button';

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

/** Catches unexpected errors below the root layout. Never shows the raw error to the user. */
export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Sentry replaces this at Milestone 9. The digest matches the server log entry.
    console.error('[app error]', error.digest ?? error);
  }, [error]);

  return (
    <main id="main" className="flex flex-1 flex-col items-center justify-center px-5 py-24 text-center">
      <p className="eyebrow">Something went wrong</p>
      <h1 className="mt-4 font-display text-title font-semibold">That did not work.</h1>
      <p className="mt-4 max-w-md text-lead text-muted-foreground">
        Your saved work is safe. Try again, and if it keeps happening, come back in a few minutes.
      </p>
      <Button className="mt-8 h-11 rounded-full px-5" onClick={reset}>
        Try again
      </Button>
    </main>
  );
}
