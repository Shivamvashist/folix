import { MAX_PORTFOLIOS_PER_USER } from '@folix/schema';
import { FilePlus2 } from 'lucide-react';
import { Suspense } from 'react';

import { requireUser } from '@/server/auth/session';

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <Dashboard />
    </Suspense>
  );
}

async function Dashboard() {
  const user = await requireUser();
  const firstName = user.name.trim().split(/\s+/)[0] || 'there';

  return (
    <>
      <p className="eyebrow">Dashboard</p>
      <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
        Hello, {firstName}.
      </h1>

      <section aria-labelledby="portfolios-title" className="mt-12">
        <div className="flex items-baseline justify-between gap-4">
          <h2 id="portfolios-title" className="font-display text-2xl font-semibold tracking-tight">
            Your portfolios
          </h2>
          <p className="font-mono text-xs tracking-wide text-muted-foreground uppercase">
            0 of {MAX_PORTFOLIOS_PER_USER} used
          </p>
        </div>

        <div className="mt-5 flex flex-col items-center rounded-2xl border border-dashed border-border px-6 py-16 text-center">
          <span className="flex size-12 items-center justify-center rounded-xl bg-brand-soft text-brand">
            <FilePlus2 aria-hidden="true" className="size-5" />
          </span>
          <p className="mt-5 font-display text-xl font-semibold tracking-tight">No portfolios yet</p>
          <p className="mt-2 max-w-sm leading-relaxed text-muted-foreground">
            Creating a portfolio from a form, CV or interview is the next thing being built. Your account is
            ready for it.
          </p>
        </div>
      </section>
    </>
  );
}

function DashboardSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading your dashboard" className="animate-pulse">
      <div className="h-4 w-24 rounded-full bg-muted" />
      <div className="mt-4 h-11 w-72 max-w-full rounded-xl bg-muted" />
      <div className="mt-14 h-64 rounded-2xl bg-muted" />
    </div>
  );
}
