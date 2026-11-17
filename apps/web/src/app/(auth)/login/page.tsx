import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

import { LoginForm } from '@/components/auth/login-form';
import { DEFAULT_SIGNED_IN_ROUTE } from '@/config/routes';
import { SITE } from '@/config/site';
import { getEnabledSocialProviders } from '@/server/auth/auth';
import { getCurrentUser } from '@/server/auth/session';

export const metadata: Metadata = {
  title: 'Sign in',
  robots: { index: false },
};

export default function LoginPage() {
  const socialProviders = getEnabledSocialProviders();

  return (
    <>
      <h1 className="font-display text-4xl font-semibold tracking-tight">Welcome to {SITE.name}</h1>
      <p className="mt-3 leading-relaxed text-muted-foreground">
        Sign in or create an account. No password needed.
      </p>

      <div className="mt-8">
        {/* The form reads the URL (?next=, ?error=), so it renders behind a boundary. */}
        <Suspense fallback={<div className="h-56 animate-pulse rounded-2xl bg-muted" />}>
          <LoginForm socialProviders={socialProviders} />
        </Suspense>
      </div>

      <Suspense fallback={null}>
        <RedirectIfSignedIn />
      </Suspense>
    </>
  );
}

/** Sends a signed-in visitor straight to the app without blocking the page for everyone else. */
async function RedirectIfSignedIn() {
  const user = await getCurrentUser();
  if (user) redirect(DEFAULT_SIGNED_IN_ROUTE);
  return null;
}
