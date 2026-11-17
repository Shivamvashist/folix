import Link from 'next/link';
import { Suspense } from 'react';

import { SignOutButton } from '@/components/app/sign-out-button';
import { Logo } from '@/components/brand/logo';
import { Container } from '@/components/layout/container';
import { ROUTES } from '@/config/routes';
import { getCurrentUser } from '@/server/auth/session';

export function AppHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
      <Container className="flex h-16 items-center justify-between gap-4">
        <Link
          href={ROUTES.dashboard}
          aria-label="Dashboard"
          className="-mx-2 rounded-md px-2 py-1 outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <Logo />
        </Link>

        <div className="flex items-center gap-2">
          <Suspense fallback={<span className="h-5 w-32 animate-pulse rounded-full bg-muted" />}>
            <UserEmail />
          </Suspense>
          <SignOutButton />
        </div>
      </Container>
    </header>
  );
}

async function UserEmail() {
  const user = await getCurrentUser();
  if (!user) return null;
  return (
    <span className="hidden max-w-56 truncate text-sm text-muted-foreground md:inline">{user.email}</span>
  );
}
