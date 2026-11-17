# CLAUDE.md: Folix

Read this before every task. Then read [docs/planning/STATUS.md](docs/planning/STATUS.md) for the current state. These rules apply to every AI agent, not only Claude.

| Doc                                                                  | What is in it                                                             |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| [docs/planning/STATUS.md](docs/planning/STATUS.md)                   | Where the build is now, what to verify, what is next. **Keep it current** |
| [docs/planning/MVP-PLAN.md](docs/planning/MVP-PLAN.md)               | The detailed plan: data model, contracts, milestones, edge cases          |
| [docs/rules/README.md](docs/rules/README.md)                         | The engineering rules, eight files. **Follow them**                       |
| [docs/design/DESIGN-SYSTEM.md](docs/design/DESIGN-SYSTEM.md)         | Colour roles, type, layout, components, motion                            |
| [docs/decisions/DECISIONS.md](docs/decisions/DECISIONS.md)           | Every major decision, one line each. **Add to it**                        |
| [docs/product/PLAN.md](docs/product/PLAN.md)                         | The product plan: what Folix is and why                                   |
| [docs/planning/FUTURE-FEATURES.md](docs/planning/FUTURE-FEATURES.md) | Ideas for after the MVP. Not committed work                               |
| [docs/engineering/environment.md](docs/engineering/environment.md)   | Every environment variable                                                |

## What Folix is

Folix turns a person's career details into a published portfolio website in a few minutes. The user gives their details once (form, CV upload or AI interview) and gets a written, designed, editable site at `/<slug>`.

One **master profile** of facts per user. Every **portfolio** is a written, styled view of it.

## Working rules (non-negotiable)

1. **One milestone at a time, in order** ([MVP-PLAN.md](docs/planning/MVP-PLAN.md)). Do not start the next while `pnpm check` fails.
2. **No em-dashes anywhere:** code, comments, copy, docs, commit messages, replies. Use a comma, colon, full stop or brackets.
3. **The schema is the source of truth.** Change `packages/schema` first, then `db`, `ai`, `templates`, then the app.
4. **The AI never invents facts about a user.** Missing detail becomes a reported gap, never a guess.
5. **User edits always win.** A locked field is never changed by regeneration, rewrite or template switch. Locks are enforced in code, not by asking the model.
6. **Every limit and rule is enforced on the server:** portfolio limit, slug rules, AI allowances, ownership, validation.
7. **Stay in scope.** No unrelated cleanup. Note it in STATUS.md under "Noticed, not done".
8. **Check edge cases** ([docs/rules/07-testing-quality.md](docs/rules/07-testing-quality.md)) and run `pnpm check` before calling work done. Report honestly what was and was not verified.
9. **Plan before building.** Features: data, contract, backend, frontend, edge cases. UI: against the design system. No generic placeholder components.
10. **Read the docs for the installed version** before using a framework API. Next.js 16 ships its docs in `apps/web/node_modules/next/dist/docs/`. This repo runs versions newer than most training data.
11. **Keep files small:** under 250 lines as the aim, 400 as the limit before splitting.
12. **Record major decisions** in DECISIONS.md and **update STATUS.md** when a milestone moves.
13. **Git:** commit or push only when the developer asks. Conventional Commits, no co-author lines.

## Stack

| Area           | Choice                                                                            |
| -------------- | --------------------------------------------------------------------------------- |
| Repo           | pnpm workspace + Turborepo. Node 22. PowerShell on Windows                        |
| App            | Next.js 16 (App Router, Cache Components, typed routes, React Compiler), React 19 |
| Language       | TypeScript strict, plus `noUncheckedIndexedAccess`. No `any`                      |
| Styling and UI | Tailwind 4, shadcn/ui on Base UI, design tokens in `globals.css`                  |
| Validation     | Zod 4, one schema shared by forms, database JSON and AI output                    |
| Database       | PostgreSQL (Neon), Drizzle ORM, `pg` driver                                       |
| Auth           | Better Auth: Google, GitHub, email magic link                                     |
| AI (from M3)   | Vercel AI SDK with a Claude model, only inside `packages/ai`                      |
| Later          | Cloudflare R2, Upstash Redis, Resend, Sentry, PostHog, Vercel hosting             |
| Quality        | ESLint 9, Prettier, Vitest, commitlint, husky, GitHub Actions                     |

## Layout

```
apps/web/              the Next.js app
  src/app/             routes only: (marketing), (auth), app, [slug], api
  src/components/      ui (shadcn), shared, layout, brand, <feature>
  src/server/          server-only code: auth, db, email, <feature> actions and rules
  src/lib/             small pure helpers
  src/config/          ROUTES, SITE
  src/content/         marketing copy as data
  src/env.ts           the only reader of process.env
packages/schema/       Zod schemas, types, product limits (source of truth)
packages/db/           Drizzle tables, migrations, queries
packages/ai/           prompts, generation, extraction, interview
packages/templates/    portfolio templates, theme tokens, registry
tooling/               shared ESLint and TypeScript config
docs/                  product, planning, rules, design, engineering, decisions
```

Dependency direction: `schema` is imported by `db`, `ai`, `templates`; all four by `apps/web`. Never the other way.

## Code rules (short version; details in docs/rules)

- **Files:** kebab-case. **Exports:** named only, except where a framework needs a default.
- **Imports:** `@/` inside the app, package roots (`@folix/schema`) across packages, never `../../`.
- **Server code** starts with `import 'server-only'`. Client components never import it.
- **Signed-in code** calls `requireUser()` first: every page, action, route handler and data function.
- **Server actions** validate with Zod, authorise by owner in the query, and return `ActionResult`.
- **Anything reading the request** (session, cookies, search params) renders inside `<Suspense>`.
- **Colours:** roles only (`bg-brand`, `text-muted-foreground`). No hex, no palette colours.
- **Links:** from `ROUTES`. A new top-level route also goes in `RESERVED_SLUGS`.
- **Env:** only through `env` from `@/env`.
- **Every UI state is designed:** loading, empty, error, pending, success.
- **User and model text is rendered as text.** Never `dangerouslySetInnerHTML`.

## Commands (PowerShell)

```powershell
pnpm dev              # run the app at http://localhost:3000
pnpm check            # format check, em-dash scan, lint, typecheck, tests (before every checkpoint)
pnpm build            # production build
pnpm format           # Prettier writes formatting
pnpm lint:fix         # ESLint with fixes
pnpm test             # tests only
pnpm db:generate      # create a migration after editing packages/db/src/schema
pnpm db:migrate       # apply migrations to DATABASE_URL
pnpm db:studio        # browse the database
pnpm dlx shadcn@latest add <name>   # add a UI primitive (run from apps/web)
pnpm add <pkg> --filter @folix/web  # add a dependency to one workspace
```
