# Decisions

Every major decision, as a plain list, newest section last. One line each: what was decided, then why. When a decision is reversed, do not delete it: strike it through and add the new one with a date.

A decision belongs here when it is hard to reverse, when someone would otherwise ask "why is it like this?", or when it settles an open question from the plan.

## Product (from the product plan, 17 Nov 2026)

1. Folix stores one master profile of facts per user, and every portfolio is a written, styled view of it. This makes template switching, a second portfolio and exports cheap.
2. The AI never invents facts. It rewrites and structures what the user gave, and reports gaps instead of guessing.
3. User edits always win. An edited field is locked against regeneration until the user unlocks it.
4. Three intake paths (form, CV upload, AI interview) all end in the same master profile.
5. Maximum 2 portfolios per user, each with its own globally unique slug.
6. Edits go to a draft. The public page changes only on Publish.
7. A changed slug redirects for 30 days and cannot be claimed by anyone else during that time.
8. Public pages live at `/<slug>` on one domain (path style) for v1. Subdomains are not built.
9. No custom HTML, CSS or scripts in portfolios.

## Stack (from the product plan, 17 Nov 2026)

10. One full-stack Next.js app in TypeScript, no separate backend service. One client and no heavy background work do not justify a second deploy.
11. PostgreSQL on Neon, not MongoDB. Slugs need unique constraints, the portfolio limit needs transactions, and JSONB covers document-style content.
12. Drizzle as the ORM. Zod for validation, with one schema shared by forms, the database JSON and AI output.
13. Better Auth for sign-in (Google, GitHub, email magic link), stored in our own Postgres. No passwords.
14. Vercel AI SDK with a Claude model. The provider can be swapped in one place.
15. Cloudflare R2 for files, Upstash Redis for rate limits, Resend for email, Vercel for hosting, Sentry and PostHog for monitoring.
16. The form path is built end to end before the CV and interview paths.

## Repository and tooling (17 Nov 2026, Milestone 1)

17. One repository as a pnpm workspace with Turborepo: `apps/web`, `packages/{schema,db,ai,templates}`, `tooling/{eslint-config,tsconfig}`.
18. Workspace packages export TypeScript source and are compiled by Next.js. No package build step, so there is nothing to keep in sync.
19. Shared dependency versions live in the pnpm catalog, so every package uses the same TypeScript, Zod, Vitest, ESLint and Drizzle.
20. TypeScript stays on 5.x and ESLint on 9.x for now, although 7.x and 10.x exist. The Next.js 16 toolchain and its lint config target these versions. Revisit when Next.js moves.
21. lint-staged is pinned to 16.x because 17.x needs Node 22.22 or later and the development machine runs 22.20.
22. Prettier settings match the Vinco project: single quotes, trailing commas, 110 columns. Tailwind classes are sorted by the Prettier plugin.
23. No em-dashes anywhere in the repo. A script and a lint rule enforce it.
24. All source files are kebab-case, including components. This matches shadcn/ui and Next.js conventions and avoids case problems between Windows and Linux.
25. Named exports only, except where a framework requires a default export. Enforced by lint.
26. Tests sit next to the code as `<module>.test.ts`, run by Vitest.
27. Conventional Commits, enforced by commitlint. Trunk-based development on `main` with short-lived branches and squash merges.
28. The quality gate is one command, `pnpm check`: format, em-dash scan, lint, typecheck, tests. CI runs it, verifies migrations match the schema, and builds.
29. Lint rules are written to enforce the rules in `docs/rules`, so documentation and enforcement cannot drift apart.
30. Docs live in `docs/` in sub-folders: `product`, `planning`, `rules`, `design`, `engineering`, `decisions`.

## Application architecture (17 Nov 2026, Milestone 1)

31. Environment variables are read and validated in one file, `apps/web/src/env.ts`. `process.env` anywhere else is a lint error. Packages never read env.
32. The env file is `apps/web/.env.local` (not the repo root), because Next.js reads it there. Drizzle's config loads the same file.
33. The database driver is `pg` (node-postgres) with a connection pool, not Neon's HTTP driver. The 2-portfolio limit and slug claims need interactive transactions, and `pg` also works against any local Postgres.
34. Drizzle maps camelCase TypeScript fields to snake_case columns automatically (`casing: 'snake_case'`).
35. Auth tables are plural (`users`, `sessions`, `accounts`, `verifications`) and keep the text ids the auth library generates. Our own tables will use database-generated UUIDs.
36. Each sign-in method switches on only when its keys are present. Without a Resend key, magic links print to the server console in development.
37. The same verified email on Google and GitHub is one account (account linking is on for those two providers).
38. `requireUser()` is the one authorisation check. Every signed-in page, server action, route handler and data function calls it. A layout check is never relied on.
39. Server actions return one shape, `ActionResult`, with a fixed set of error codes. They throw only for bugs.
40. Mutations are server actions. Route handlers are only for streaming, uploads, callbacks and public endpoints.
41. Next.js 16 Cache Components and Partial Prefetching are on (the framework defaults for new apps). Anything that reads the request renders inside a Suspense boundary.
42. Internal links are typed (`typedRoutes`) and come from `ROUTES`. No path string literals.
43. A test fails if a top-level app route is not in the reserved slug list, so a portfolio can never shadow an app page.
44. Slugs are 3 to 30 characters: lowercase letters, digits and single hyphens, not starting or ending with a hyphen.
45. Security headers are set for all responses from Milestone 1. A Content Security Policy is added before launch, at Milestone 9.
46. No global client state library. Server data stays on the server, URL state in the URL, and local state in components. Add a store only when a concrete feature needs one.
47. No end-to-end tests until Milestone 5, when there is a full journey to test. Integration tests against a real Postgres start at Milestone 2.

## Design (17 Nov 2026, Milestone 1)

48. UI primitives come from shadcn/ui on Base UI (the CLI's current default), added per component as needed.
49. The look: warm paper background, ink text, one ultramarine brand colour. Bricolage Grotesque for display, Geist for body, Geist Mono for labels.
50. Components use colour roles (`bg-brand`, `text-muted-foreground`), never raw colours. Hex values and arbitrary colour classes are a lint error.
51. Dark mode follows the system setting through CSS only. No toggle and no script, so there is no flash. A manual toggle can be added later.
52. Marketing copy lives in `content/marketing.ts` as data. Section components hold layout only.
53. Marketing copy describes only what the product does. No invented numbers, customers or quotes. Sample content is labelled as an example.
54. The hero illustration is built from markup, not a screenshot, so it stays sharp, themed and light.

## MVP plan (17 Nov 2026)

55. The MVP is the nine milestones in `docs/planning/MVP-PLAN.md`. Everything in the plan's "later" list is out of scope.
56. The published state is a full snapshot of content, template and theme, not content alone. Otherwise a draft theme change would restyle the live page.
57. Locks are enforced by a merge function in code after the model responds, never by instructing the model.
58. Stored content documents carry a `version` field so their shape can change later without a risky bulk migration.
59. The content schema has no field for phone numbers or street addresses, so CV data of that kind cannot reach a public page.
60. A `reports` table is added to the plan's eight tables, for the report link.
61. AI output streams over a route handler and is saved once, when a complete and validated result arrives. No background job system in the MVP.
62. Working defaults until decided otherwise: first audience is developers; 5 generations and 30 rewrites per user per day; 3 slug changes per 30 days; generate-before-sign-up is deferred to the end of Milestone 9.

## Still open

See "Open questions" in [../planning/MVP-PLAN.md](../planning/MVP-PLAN.md): first audience, model choice, try-before-sign-up, daily allowance, domain, template styles, pricing, slug change limit.
