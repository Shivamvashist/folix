# Environment variables

All variables are declared and validated in [`apps/web/src/env.ts`](../../apps/web/src/env.ts). The app refuses to start, with a clear message, when a required one is missing or malformed.

Local values go in `apps/web/.env.local` (git-ignored). The template is [`apps/web/.env.example`](../../apps/web/.env.example). Production and preview values are set in the Vercel project.

## Current variables

| Variable               | Required | Used for                                | Notes                                                                                       |
| ---------------------- | -------- | --------------------------------------- | ------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_APP_URL`  | Yes      | Absolute URLs, auth callbacks, metadata | No trailing slash. Sent to the browser.                                                     |
| `DATABASE_URL`         | Yes      | Postgres connection                     | On Neon, use the pooled connection string.                                                  |
| `BETTER_AUTH_SECRET`   | Yes      | Signing sessions                        | At least 32 characters. `openssl rand -base64 32`. Different per environment.               |
| `GOOGLE_CLIENT_ID`     | No       | Google sign-in                          | Both Google values are needed for the button to appear.                                     |
| `GOOGLE_CLIENT_SECRET` | No       | Google sign-in                          | Redirect URI: `<app url>/api/auth/callback/google`                                          |
| `GITHUB_CLIENT_ID`     | No       | GitHub sign-in                          | Both GitHub values are needed for the button to appear.                                     |
| `GITHUB_CLIENT_SECRET` | No       | GitHub sign-in                          | Callback URL: `<app url>/api/auth/callback/github`                                          |
| `RESEND_API_KEY`       | No (dev) | Sending magic link emails               | Without it, links print to the server console in development. Required in production.       |
| `EMAIL_FROM`           | No       | The sender of emails                    | Defaults to Resend's test sender. Use a verified domain in production.                      |
| `SKIP_ENV_VALIDATION`  | No       | Skipping validation                     | `true` only for tooling that must load the config without real values. Never in production. |

## Coming with later milestones

| Milestone | Variables                                                                                     |
| --------- | --------------------------------------------------------------------------------------------- |
| 3         | `ANTHROPIC_API_KEY`                                                                           |
| 6         | `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`                      |
| 9         | `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `SENTRY_DSN`, `NEXT_PUBLIC_POSTHOG_KEY` |

## Adding a variable

1. Declare it in `apps/web/src/env.ts` with a Zod type (server or client).
2. Add it, without a value, to `apps/web/.env.example`.
3. Add it to the `env` list of the `build` task in `turbo.json`, so the build cache knows about it.
4. Add a placeholder to `.github/workflows/ci.yml` if the build needs it.
5. Set it in Vercel for production and preview.
6. Add a row to this file.

## Rules

- Only `env.ts` reads `process.env`. Lint enforces this.
- `NEXT_PUBLIC_` variables are visible to everyone. Never put a secret behind that prefix.
- Never commit a real value. A value that leaked is rotated, not hidden.
- Use different keys for local, preview and production.
