# Status

The current state of the build. Update it when a milestone starts or finishes, so anyone (or any AI model) can pick up from this file alone. Plan: [MVP-PLAN.md](MVP-PLAN.md).

## Milestones

| #   | Milestone                      | State                                                             |
| --- | ------------------------------ | ----------------------------------------------------------------- |
| 1   | Foundation                     | Built, sign-in not yet verified against real services (see below) |
| 2   | Schema and first template      | Next                                                              |
| 3   | Form intake and generation     | Not started                                                       |
| 4   | Editor                         | Not started                                                       |
| 5   | Publish                        | Not started                                                       |
| 6   | CV upload                      | Not started                                                       |
| 7   | AI interview                   | Not started                                                       |
| 8   | Templates 2 to 4 and switching | Not started                                                       |
| 9   | Launch readiness               | Not started                                                       |

## What exists (17 Nov 2026)

- Monorepo, tooling, CI workflow, git hooks.
- `@folix/schema`: slug rules, reserved slugs, product limits, with tests.
- `@folix/db`: client, auth tables, first migration (generated, not yet applied to a database).
- `@folix/ai`, `@folix/templates`: empty packages, wired into the workspace.
- `@folix/web`: env validation, auth (Google, GitHub, magic link), design tokens, landing page, login, dashboard shell, health route, error and not-found pages, robots and sitemap.
- Docs: rules, design system, MVP plan, future features, decisions.

Verified: `pnpm check` passes (format, em-dash scan, lint, typecheck, 27 tests). `pnpm build` passes. Landing and login pages were viewed in a browser at desktop and phone width, light and dark.

## To verify (needs real keys, could not be done at build time)

- [ ] `pnpm db:migrate` against a Neon database.
- [ ] Magic link sign-in end to end (the link prints to the server console without a Resend key).
- [ ] Google and GitHub sign-in end to end.
- [ ] Signed-out visit to `/app` redirects to `/login`; signed-in visit to `/login` redirects to `/app`.
- [ ] `/api/health` returns 200 with a database connected.
- [ ] CI run on GitHub (the workflow has not run yet: nothing has been pushed).
- [x] Git hooks on a real commit (pre-commit formatting, commit message check). Verified 17 Nov 2026.

## Before Milestone 2

- [ ] Create the Neon project, put `DATABASE_URL` in `apps/web/.env.local`, run `pnpm db:migrate`.
- [ ] Create the Google and GitHub OAuth apps and add their keys.
- [ ] Work through "To verify" above.
- [ ] Decide the first audience (recommendation: developers).
- [ ] Decide the branch setup: the repo is on a branch named `prod`, and the rules assume `main` as the trunk.
- [ ] Decide whether to delete the original `plan/` folder, now that the plan lives at `docs/product/PLAN.md`.

## Noticed, not done

- The login page and dashboard have no automated test yet. They need a database, so they are covered from Milestone 2 (integration) and Milestone 5 (end to end).
- No Open Graph image yet. The landing page shares with a text card until Milestone 5 adds generated images.
- The wide feature cards on the landing page have spare room for a small illustration each. Worth doing in the Milestone 9 landing pass, with real template screenshots.
- A manual light and dark toggle is not built: the scheme follows the system.
