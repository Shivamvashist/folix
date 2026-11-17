# Folix engineering rules

The rules every change follows, so the codebase reads as if one person wrote it. They apply to humans and AI agents alike. Many are enforced by `pnpm check` (format, em-dash scan, lint, typecheck, tests). The rest are on whoever writes the code.

| File                                             | Covers                                                                            |
| ------------------------------------------------ | --------------------------------------------------------------------------------- |
| [01-conventions.md](01-conventions.md)           | Naming, files, exports, imports, TypeScript, comments                             |
| [02-architecture.md](02-architecture.md)         | Workspace layout, package boundaries, where code goes, where state lives          |
| [03-frontend.md](03-frontend.md)                 | Components, server and client, styling, forms, states, accessibility, performance |
| [04-backend.md](04-backend.md)                   | Server actions, route handlers, auth, database, transactions, caching, errors     |
| [05-ai.md](05-ai.md)                             | Prompts, structured output, the no-invented-facts rule, locks, cost control       |
| [06-security-privacy.md](06-security-privacy.md) | Input, secrets, uploads, personal data, public pages, abuse                       |
| [07-testing-quality.md](07-testing-quality.md)   | What to test, the edge-case checklist, definition of done                         |
| [08-git-workflow.md](08-git-workflow.md)         | Branches, commits, pull requests, releases, dependencies                          |

Related: [../design/DESIGN-SYSTEM.md](../design/DESIGN-SYSTEM.md), [../decisions/DECISIONS.md](../decisions/DECISIONS.md), [../planning/MVP-PLAN.md](../planning/MVP-PLAN.md).

## Working rules (non-negotiable)

1. **Build one milestone at a time, in order.** The order is in [MVP-PLAN.md](../planning/MVP-PLAN.md). Do not start a milestone while the previous one fails `pnpm check`.
2. **No em-dashes anywhere:** code, comments, copy, docs, commit messages. Use a comma, colon, full stop or brackets. `pnpm check:dashes` and lint enforce it.
3. **The schema is the source of truth.** A change to a content shape starts in `packages/schema`, then flows to `db`, `ai`, `templates` and the app, in that order, in one change.
4. **The two product rules are never broken:** the AI never invents facts about a user, and a field the user edited is never overwritten by regeneration unless they unlock it. If a change makes either harder to guarantee, stop and flag it.
5. **Every limit and rule is enforced on the server.** The UI may also check, for a faster answer, but the server check is the real one. This covers the portfolio limit, slug rules, AI allowances, ownership and input validation.
6. **Stay in scope.** No unrelated cleanup, refactoring or restyling inside a feature. Note what you spot in [STATUS.md](../planning/STATUS.md) under "Noticed, not done".
7. **Check edge cases and errors on every change** ([07-testing-quality.md](07-testing-quality.md)) and run `pnpm check` before calling anything done.
8. **Plan before building.** Features get a short plan (data, contract, backend, frontend, edge cases). UI is planned against the design system before code is written. No generic placeholder components.
9. **Read the docs for the installed version** before using a framework API. Next.js ships its docs in `apps/web/node_modules/next/dist/docs/`. This repo runs versions newer than most training data and examples online.
10. **Keep files small.** Aim for under 250 lines. Up to 400 is fine when a file needs it. Past 400, split by responsibility.
11. **Record major decisions** as one line in [DECISIONS.md](../decisions/DECISIONS.md) in the same change that makes them.
12. **Update [STATUS.md](../planning/STATUS.md)** when a milestone starts or finishes, so anyone (or any AI model) can pick up from it alone.
13. **Git:** commit or push only when the developer asks. Suggest a Conventional Commits message at each checkpoint.

## When rules conflict

Correctness and security first, then the two product rules, then these rules, then personal taste. If a rule is wrong for a case, do not quietly break it: change the rule in the same pull request and say why.
