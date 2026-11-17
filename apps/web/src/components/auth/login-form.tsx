'use client';

import { MailCheck } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { type FormEvent, useId, useState } from 'react';
import { z } from 'zod';

import { GitHubIcon, GoogleIcon } from '@/components/auth/provider-icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DEFAULT_SIGNED_IN_ROUTE, ROUTES } from '@/config/routes';
import { authClient } from '@/lib/auth-client';
import { getSafeRedirectPath } from '@/lib/safe-redirect';

type SocialProvider = 'google' | 'github';

type LoginFormProps = {
  /** Sign-in methods with keys configured on the server. */
  socialProviders: readonly SocialProvider[];
};

type Status =
  | { kind: 'idle' }
  | { kind: 'pending'; method: SocialProvider | 'email' }
  | { kind: 'sent'; email: string }
  | { kind: 'error'; message: string };

const PROVIDER_LABELS: Record<SocialProvider, string> = {
  google: 'Continue with Google',
  github: 'Continue with GitHub',
};

const GENERIC_ERROR = 'Something went wrong. Please try again.';
const emailSchema = z.email();

export function LoginForm({ socialProviders }: LoginFormProps) {
  const searchParams = useSearchParams();
  const emailId = useId();
  const errorId = useId();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>(() =>
    // The auth callback returns here with ?error= when a provider sign-in fails.
    searchParams.has('error')
      ? { kind: 'error', message: 'That sign-in did not complete. Please try again.' }
      : { kind: 'idle' },
  );

  const callbackURL = getSafeRedirectPath(searchParams.get('next'), DEFAULT_SIGNED_IN_ROUTE);
  const isPending = status.kind === 'pending';

  async function handleSocialSignIn(provider: SocialProvider) {
    if (isPending) return;
    setStatus({ kind: 'pending', method: provider });
    const { error } = await authClient.signIn.social({
      provider,
      callbackURL,
      errorCallbackURL: ROUTES.login,
    });
    // On success the browser is already navigating to the provider.
    if (error) setStatus({ kind: 'error', message: GENERIC_ERROR });
  }

  async function handleEmailSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isPending) return;

    const parsed = emailSchema.safeParse(email.trim());
    if (!parsed.success) {
      setStatus({ kind: 'error', message: 'Enter a valid email address.' });
      return;
    }

    setStatus({ kind: 'pending', method: 'email' });
    const { error } = await authClient.signIn.magicLink({ email: parsed.data, callbackURL });
    setStatus(
      error
        ? {
            kind: 'error',
            message: error.status === 429 ? 'Too many attempts. Wait a minute and try again.' : GENERIC_ERROR,
          }
        : { kind: 'sent', email: parsed.data },
    );
  }

  if (status.kind === 'sent') {
    return (
      <div role="status" className="rounded-2xl border border-border bg-card p-6 text-center">
        <span className="mx-auto flex size-11 items-center justify-center rounded-full bg-brand-soft text-brand">
          <MailCheck aria-hidden="true" className="size-5" />
        </span>
        <p className="mt-4 font-display text-xl font-semibold tracking-tight">Check your inbox</p>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          We sent a sign-in link to{' '}
          <span className="font-medium break-all text-foreground">{status.email}</span>. It expires in 10
          minutes.
        </p>
        <Button variant="ghost" className="mt-4 h-11" onClick={() => setStatus({ kind: 'idle' })}>
          Use a different email
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {socialProviders.length > 0 ? (
        <>
          <div className="space-y-3">
            {socialProviders.map((provider) => (
              <Button
                key={provider}
                type="button"
                variant="outline"
                className="h-11 w-full gap-2.5 text-sm"
                disabled={isPending}
                aria-busy={status.kind === 'pending' && status.method === provider}
                onClick={() => handleSocialSignIn(provider)}
              >
                {provider === 'google' ? (
                  <GoogleIcon className="size-4" />
                ) : (
                  <GitHubIcon className="size-4" />
                )}
                {PROVIDER_LABELS[provider]}
              </Button>
            ))}
          </div>

          <div className="flex items-center gap-3" role="separator">
            <span className="h-px flex-1 bg-border" />
            <span className="font-mono text-xs tracking-wide text-muted-foreground uppercase">or</span>
            <span className="h-px flex-1 bg-border" />
          </div>
        </>
      ) : null}

      <form onSubmit={handleEmailSubmit} noValidate className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor={emailId}>Email</Label>
          <Input
            id={emailId}
            type="email"
            name="email"
            autoComplete="email"
            inputMode="email"
            placeholder="you@example.com"
            className="h-11"
            value={email}
            disabled={isPending}
            aria-invalid={status.kind === 'error'}
            aria-describedby={status.kind === 'error' ? errorId : undefined}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>
        <Button type="submit" className="h-11 w-full text-sm" disabled={isPending}>
          {status.kind === 'pending' && status.method === 'email'
            ? 'Sending link...'
            : 'Email me a sign-in link'}
        </Button>
      </form>

      <p id={errorId} role="alert" aria-live="polite" className="min-h-5 text-sm text-destructive">
        {status.kind === 'error' ? status.message : null}
      </p>
    </div>
  );
}
