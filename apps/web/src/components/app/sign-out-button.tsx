'use client';

import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { ROUTES } from '@/config/routes';
import { authClient } from '@/lib/auth-client';

export function SignOutButton() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  async function handleSignOut() {
    if (isPending) return;
    setIsPending(true);
    const { error } = await authClient.signOut();
    if (error) {
      // Still signed in: let the user try again.
      setIsPending(false);
      return;
    }
    router.replace(ROUTES.home);
    router.refresh();
  }

  return (
    <Button variant="ghost" className="h-11 gap-2 px-3" disabled={isPending} onClick={handleSignOut}>
      <LogOut aria-hidden="true" />
      <span className="hidden sm:inline">{isPending ? 'Signing out...' : 'Sign out'}</span>
      <span className="sr-only sm:hidden">Sign out</span>
    </Button>
  );
}
