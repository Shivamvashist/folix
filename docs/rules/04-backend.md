# 04. Backend: server actions, route handlers, auth, database

There is no separate API service. The backend is server actions (mutations), route handlers (streams, uploads, callbacks) and server-only functions, all inside `apps/web/src/server` and `packages/db`.

## 1. The request path

Every mutation and every protected read goes through the same five steps, in this order:

1. **Authenticate:** `const user = await requireUser()`.
2. **Validate:** parse the input with a Zod schema. Never trust types from the client.
3. **Authorise:** check the user owns the specific record. Always filter by `userId` in the query itself.
4. **Do the work:** call the feature function, inside a transaction when it writes more than one row.
5. **Respond:** return `ActionResult`, revalidate the cache tags that changed.

A layout or page check does not protect a server action or a route handler. Each one authorises itself.

## 2. Server actions

- One action per file: `server/<feature>/<verb-noun>.action.ts`, starting with `'use server'`, exporting one async function ending in `Action`.
- **Input is `unknown` until parsed.** The first lines are `requireUser()` and `schema.safeParse(input)`.
- **Return `ActionResult<TData>`** from `@/lib/action-result`. Never throw for something the user can act on.

  ```ts
  'use server';

  export async function renameSlugAction(input: unknown): Promise<ActionResult<{ slug: string }>> {
    const user = await requireUser();
    const parsed = renameSlugSchema.safeParse(input);
    if (!parsed.success)
      return fail('validation', 'Check the highlighted fields.', toFieldErrors(parsed.error));

    const result = await renameSlug({ userId: user.id, ...parsed.data });
    if (!result.ok) return fail(result.code, SLUG_MESSAGES[result.code]);

    updateTag(`portfolio:${parsed.data.portfolioId}`);
    return ok({ slug: result.slug });
  }
  ```

- **Error codes are a fixed set** (`ActionErrorCode`): `unauthenticated`, `forbidden`, `notFound`, `validation`, `conflict`, `rateLimited`, `limitReached`, `internal`. The UI switches on the code, never on the message text.
- **Messages are written for the user.** Never return an exception message, SQL error or stack trace. Log the real error on the server.
- **Not found and not yours look the same.** When a record belongs to someone else, return `notFound`. Do not reveal that it exists.
- **Actions are safe to retry.** A double click or a retry after a timeout must not create two portfolios or charge two generations. Use unique constraints, upserts and idempotency keys for anything with side effects.
- Throw only for bugs and broken invariants. Those reach `error.tsx` and the error tracker.

## 3. Route handlers

Use a route handler only for what an action cannot do: streaming AI output, file uploads, third-party callbacks and webhooks, public event collection, health checks.

- Same five steps as actions. Validate the body, query and params with Zod.
- **Responses are JSON with one error shape:** `{ "error": { "code": "...", "message": "..." } }` and the matching HTTP status (400 validation, 401 unauthenticated, 403 forbidden, 404 not found, 409 conflict, 413 too large, 429 rate limited, 500 internal).
- Paths are kebab-case under `/api/`. JSON keys are camelCase.
- Anything public, expensive or that sends a message is **rate limited** (per user when signed in, per IP otherwise). A 429 includes `Retry-After`.
- Lists are paginated with a cursor, a default page size and a maximum. Never return an unbounded list.
- Webhooks verify the signature before reading the body as trusted, and are idempotent by event id.
- Set `Cache-Control` on purpose. Anything per-user is `no-store`.

## 4. Authentication and authorisation

- Better Auth, configured in `server/auth/auth.ts`. Sign-in methods: Google, GitHub, email magic link. No passwords.
- **`requireUser()`** (`server/auth/session.ts`) is the only way to get the current user in protected code. It redirects to login when there is no session. `getCurrentUser()` returns `null` instead, for optional personalisation.
- The rest of the app sees the narrow `CurrentUser` type, never the raw session object.
- **Ownership is checked in the query:** `where(and(eq(portfolios.id, id), eq(portfolios.userId, user.id)))`. Never load a record by id alone and compare afterwards in a separate, forgettable step.
- Data functions that take a `userId` are not exported to routes directly unless the caller has just resolved that id from the session. A client-supplied user id is never trusted.
- Redirects after sign-in go through `getSafeRedirectPath()` so a link cannot send a user to another site.
- Session cookies are HTTP-only, secure and same-site (the library's defaults). Do not weaken them.

## 5. Database

**Schema**

- Tables are defined in `packages/db/src/schema/`, one file per domain, exported from `schema/index.ts`.
- Names: plural snake_case tables, camelCase columns in TypeScript (stored snake_case). Index and constraint names follow `<table>_<columns>_<suffix>`.
- **Every table has** `id`, `createdAt`, `updatedAt` (all timestamps `timestamptz`, UTC). Our own tables use UUID primary keys generated by the database. Auth tables keep the text ids the auth library generates.
- **Rules live in the database, not only in code:** `NOT NULL` by default, `UNIQUE` for slugs, foreign keys with an explicit `onDelete`, `CHECK` constraints for fixed sets and ranges.
- **Every foreign key column has an index.** Add an index for each query a feature runs, and name the query in the PR.
- **Decide deletes on purpose.** User-owned data cascades from `users` so account deletion is complete. Use `restrict` where deleting a parent by accident would lose data.
- JSONB content columns (`profiles.content`, `portfolios.draft_content`, `published_content`) are validated with the Zod schema from `@folix/schema` on every write and every read. A stored shape that fails parsing is a bug to surface, not to ignore.
- Do not store what can be derived (a portfolio count, a "has draft changes" flag that can be computed).

**Migrations**

- Change the schema file, then `pnpm db:generate`. Review the generated SQL. Commit the schema change and the migration together. CI fails if they differ.
- **Never edit or delete a migration that has been applied anywhere shared.** Fix forward with a new one.
- **Migrations are backward compatible with the code already running.** Add a column as nullable or with a default, deploy code that uses it, then tighten. Removing or renaming takes two releases: stop using it, then drop it.
- A migration on a large table must not lock it for long: create indexes concurrently, backfill in batches.
- `pnpm db:migrate` applies migrations. Production migrations run in the deploy pipeline, never by hand from a laptop.

**Queries**

- Query functions live in `packages/db/src/queries/<domain>.ts`, take `db: Database` as the first argument, and do storage only.
- Select only the columns you need. No `select *` into a client response.
- No N+1: load related rows with a join or one `inArray` query.
- All values go through Drizzle parameters. Never build SQL by joining strings.
- Lists are always bounded (`limit`) and ordered by something stable.

**Transactions**

- A user action that writes more than one row runs in `db.transaction`, reading fresh values inside it.
- **Limits and uniqueness are enforced so that two requests at once cannot both pass.** The 2-portfolio limit: lock the user row (`select ... for update`) or rely on a constraint, then count, then insert, all in one transaction. A slug claim relies on the `UNIQUE` constraint and maps the violation to `conflict`. Never "check, then insert" in two separate statements without one of these.
- Keep transactions short. No network calls (AI, email, storage) inside one.

## 6. External services

Applies to the AI provider, email, object storage, rate limiting and analytics.

- Each service has one wrapper module in `server/<service>/` (or `packages/ai`). Feature code never calls an SDK directly.
- Every call has a timeout. Retries only for calls that are safe to repeat, with backoff, and a small maximum.
- **Decide the failure behaviour per call:** essential (saving, publishing) surfaces an error the user can act on and keeps their data; optional (analytics, a nudge email) fails quietly, is logged, and never blocks the user.
- Never call a slow service inside a database transaction.
- Work that can take more than a few seconds streams progress to the user or runs as a background job with a visible status. Nothing leaves the user staring at a frozen button.

## 7. Errors and logging

- **Never swallow an error silently.** Either handle it and say so in a comment, or log it and rethrow.
- Log with a prefix naming the area: `console.error('[publish] snapshot failed', { portfolioId, error })`. From Milestone 9 these go to Sentry.
- **Never log secrets, tokens, full CV text, email bodies or other personal content.** Log ids.
- `console.log` is not allowed in committed code (lint warns). Use `console.warn` and `console.error`.
- The user sees a calm, specific message. The log has the detail. They are never the same string.

## 8. Configuration

- All environment variables are declared and validated in `apps/web/src/env.ts`. `process.env` anywhere else is a lint error.
- Server secrets never have the `NEXT_PUBLIC_` prefix and are never passed to a client component.
- Behaviour that differs by environment is driven by an env variable, not by `if (hostname === ...)`.
- Reference: [../engineering/environment.md](../engineering/environment.md).
