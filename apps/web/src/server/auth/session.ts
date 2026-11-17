import 'server-only';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { cache } from 'react';

import { ROUTES } from '@/config/routes';
import { auth } from '@/server/auth/auth';

/** The narrow user shape the rest of the app sees. Never pass the raw session around. */
export type CurrentUser = {
  id: string;
  name: string;
  email: string;
  image: string | null;
};

/**
 * Reads the session for this request. Wrapped in `cache` so a page, its layout and its
 * data functions share one lookup per request.
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;
  const { id, name, email, image } = session.user;
  return { id, name, email, image: image ?? null };
});

/**
 * The authorisation check. Call it at the top of every signed-in page, server action,
 * route handler and data function: a layout check alone does not protect its children.
 */
export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect(ROUTES.login);
  return user;
}
