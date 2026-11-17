import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

/**
 * The only file that reads process.env. Everything else imports `env` from here,
 * so a missing or malformed variable fails at startup with a clear message.
 *
 * Adding a variable: add it here, to .env.example, to turbo.json (build env) and to
 * docs/engineering/environment.md.
 */
export const env = createEnv({
  server: {
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    DATABASE_URL: z.url(),
    BETTER_AUTH_SECRET: z.string().min(32, 'Generate one with: openssl rand -base64 32'),

    // Each sign-in method switches on only when its keys are present.
    GOOGLE_CLIENT_ID: z.string().min(1).optional(),
    GOOGLE_CLIENT_SECRET: z.string().min(1).optional(),
    GITHUB_CLIENT_ID: z.string().min(1).optional(),
    GITHUB_CLIENT_SECRET: z.string().min(1).optional(),

    // Without a key, magic links are printed to the server console (development only).
    RESEND_API_KEY: z.string().min(1).optional(),
    EMAIL_FROM: z.string().min(1).default('Folix <onboarding@resend.dev>'),
  },
  client: {
    NEXT_PUBLIC_APP_URL: z.url(),
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },
  emptyStringAsUndefined: true,
  skipValidation: process.env.SKIP_ENV_VALIDATION === 'true',
});
