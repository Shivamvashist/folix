# Folix

Folix turns a person's career details into a published portfolio website in a few minutes. Give your details once, by form, CV upload or a short AI interview, and get a written, designed, editable site at your own URL.

## Getting started

Requirements: Node 22.12 or later, pnpm 10.

```powershell
pnpm install
Copy-Item apps/web/.env.example apps/web/.env.local   # then fill in the values
pnpm db:migrate                                       # needs DATABASE_URL
pnpm dev                                              # http://localhost:3000
```

The minimum to run locally is `NEXT_PUBLIC_APP_URL`, `DATABASE_URL` and `BETTER_AUTH_SECRET`. Without a Resend key, sign-in links are printed to the server console. Every variable is explained in [docs/engineering/environment.md](docs/engineering/environment.md).

## Commands

| Command            | Does                                                  |
| ------------------ | ----------------------------------------------------- |
| `pnpm dev`         | Run the app                                           |
| `pnpm check`       | Format check, em-dash scan, lint, typecheck and tests |
| `pnpm build`       | Production build                                      |
| `pnpm format`      | Format every file with Prettier                       |
| `pnpm db:generate` | Create a migration after changing the database schema |
| `pnpm db:migrate`  | Apply migrations                                      |
| `pnpm db:studio`   | Browse the database                                   |

## Repository

```
apps/web/            the Next.js app (the only deployable)
packages/schema/     Zod schemas, types and product limits
packages/db/         Drizzle tables, migrations and queries
packages/ai/         prompts, generation, extraction, interview
packages/templates/  portfolio templates and theme tokens
tooling/             shared ESLint and TypeScript config
docs/                product, planning, rules, design, engineering, decisions
```

## Docs

Start at [docs/README.md](docs/README.md). The essentials:

- [Product plan](docs/product/PLAN.md)
- [MVP plan](docs/planning/MVP-PLAN.md) and [status](docs/planning/STATUS.md)
- [Engineering rules](docs/rules/README.md)
- [Design system](docs/design/DESIGN-SYSTEM.md)
- [Decisions](docs/decisions/DECISIONS.md)
- [Future features](docs/planning/FUTURE-FEATURES.md)
