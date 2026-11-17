import 'server-only';

import { schema } from '@folix/db';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { nextCookies } from 'better-auth/next-js';
import { magicLink } from 'better-auth/plugins/magic-link';

import { env } from '@/env';
import { db } from '@/server/db';
import { sendMagicLinkEmail } from '@/server/email/send-magic-link-email';

const MAGIC_LINK_TTL_SECONDS = 10 * 60;

export const auth = betterAuth({
  baseURL: env.NEXT_PUBLIC_APP_URL,
  secret: env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user: schema.users,
      session: schema.sessions,
      account: schema.accounts,
      verification: schema.verifications,
    },
  }),
  // Passwords are not offered: sign-in is Google, GitHub or an email magic link.
  emailAndPassword: { enabled: false },
  socialProviders: {
    ...(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
      ? { google: { clientId: env.GOOGLE_CLIENT_ID, clientSecret: env.GOOGLE_CLIENT_SECRET } }
      : {}),
    ...(env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET
      ? { github: { clientId: env.GITHUB_CLIENT_ID, clientSecret: env.GITHUB_CLIENT_SECRET } }
      : {}),
  },
  account: {
    // The same verified email on Google and GitHub is one Folix account, not two.
    accountLinking: { enabled: true, trustedProviders: ['google', 'github'] },
  },
  plugins: [
    magicLink({
      expiresIn: MAGIC_LINK_TTL_SECONDS,
      sendMagicLink: async ({ email, url }) => {
        await sendMagicLinkEmail({ to: email, url });
      },
    }),
    // Must stay last: lets server actions set auth cookies.
    nextCookies(),
  ],
});

export type SocialProvider = 'google' | 'github';

/** Sign-in methods that have keys configured. The login page renders only these. */
export function getEnabledSocialProviders(): SocialProvider[] {
  const providers: SocialProvider[] = [];
  if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) providers.push('google');
  if (env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET) providers.push('github');
  return providers;
}
