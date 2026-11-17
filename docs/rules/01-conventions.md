# 01. Conventions: naming, files, exports, TypeScript

## 1. Naming

| Thing                     | Convention                                                            | Example                                                   |
| ------------------------- | --------------------------------------------------------------------- | --------------------------------------------------------- |
| Folders                   | kebab-case                                                            | `components/marketing/`, `server/auth/`                   |
| All source files          | kebab-case, named after the main export                               | `link-button.tsx` exports `LinkButton`                    |
| Next.js special files     | The framework's names                                                 | `page.tsx`, `layout.tsx`, `route.ts`, `proxy.ts`          |
| Route segments            | kebab-case; `(group)` for layout groups, `[param]` for params         | `app/(auth)/login/`, `app/[slug]/`                        |
| Test files                | Next to the code, `<module>.test.ts`                                  | `slug.ts` and `slug.test.ts`                              |
| React components          | PascalCase                                                            | `HeroPreview`                                             |
| Props types               | `<Component>Props`                                                    | `LinkButtonProps`                                         |
| Hooks                     | camelCase starting with `use`, file `use-thing.ts`                    | `useAutosave` in `use-autosave.ts`                        |
| Types                     | PascalCase, `type` not `interface`, no `I` or `T` prefix              | `CurrentUser`, `SlugIssue`                                |
| Generic parameters        | `T` prefix with a meaning                                             | `ActionResult<TData>`                                     |
| Functions and variables   | camelCase; functions start with a verb                                | `getSlugIssue()`, `requireUser()`                         |
| Booleans                  | `is`, `has`, `should`, `can` prefix                                   | `isPending`, `hasDraftChanges`                            |
| Event props and handlers  | `onX` for props, `handleX` inside the component                       | `onSelect={handleSelect}`                                 |
| Module-level constants    | SCREAMING_SNAKE_CASE                                                  | `MAX_PORTFOLIOS_PER_USER`                                 |
| Config and token objects  | SCREAMING_SNAKE_CASE object, camelCase keys                           | `ROUTES.dashboard`, `SITE.name`                           |
| String unions (not enums) | camelCase literals                                                    | `type SlugIssue = 'tooShort' \| 'reserved'`               |
| Zod schemas               | camelCase ending in `Schema`; inferred type without it                | `slugSchema` and `type Slug`                              |
| Server actions            | Verb first, ending in `Action`, file `<verb-noun>.action.ts`          | `publishPortfolioAction` in `publish-portfolio.action.ts` |
| Data functions (queries)  | `get`, `list`, `find` (may return null), `create`, `update`, `delete` | `getPortfolioById`, `listPortfoliosByUser`                |
| Database tables           | snake_case, plural                                                    | `portfolios`, `slug_history`                              |
| Database columns          | camelCase in TypeScript, stored as snake_case by Drizzle              | `publishedAt` is `published_at`                           |
| Indexes and constraints   | `<table>_<columns>_<idx or key or fk or check>`                       | `sessions_user_id_idx`                                    |
| Packages                  | `@folix/<name>`                                                       | `@folix/schema`                                           |
| URL paths                 | kebab-case; JSON bodies camelCase                                     | `/api/portfolio-events`                                   |
| Environment variables     | SCREAMING_SNAKE_CASE; `NEXT_PUBLIC_` only if safe in a browser        | `DATABASE_URL`, `NEXT_PUBLIC_APP_URL`                     |
| Cache tags                | `<entity>:<id>`                                                       | `portfolio:8f3a...`, `portfolios:user:<id>`               |
| CSS variables and tokens  | kebab-case, named by role, not by look                                | `--brand`, `--muted-foreground` (never `--blue`)          |
| Analytics events          | snake_case, object then past-tense verb                               | `intake_started`, `portfolio_published`                   |
| Branches                  | `<type>/<short-kebab-description>`                                    | `feat/form-intake`                                        |

- No abbreviations except well-known ones (`id`, `url`, `db`, `env`, `cv`, `ai`, `seo`).
- Use the product vocabulary from the plan, the same word everywhere: **master profile**, **portfolio**, **intake**, **gap check**, **draft**, **published snapshot**, **slug**, **template**, **theme**, **section**, **locked field**. Do not invent synonyms (`site`, `page`, `handle`, `username`).
- Lint enforces naming for variables, functions, parameters and types (`@typescript-eslint/naming-convention`).

## 2. Exports and imports

**Exports**

- **Named exports only.** Default exports are allowed only where a tool requires them: Next.js special files (`page`, `layout`, `error`, `not-found`, `robots`, `sitemap`, image routes) and config files. Lint enforces this.
- **One exported component per file.** Small sub-components used only in that file may sit below it, unexported.
- **Exported functions have explicit return types** when the type is part of a contract: data functions, server actions, package APIs.
- **Each package has one public API**, its `src/index.ts`. Other code imports `@folix/schema`, never `@folix/schema/src/slug`. Lint enforces this.
- **Inside the app there are no barrel files.** Import each module directly: `import { LinkButton } from '@/components/shared/link-button'`. Barrels hide circular imports and slow the bundler.
- **Private helpers stay unexported**, below the main export. Needed in two places? Move it to `src/lib/` (app) or the right package.

**Imports**

- `@/` points to `apps/web/src`. Use relative imports only for a sibling file (`./slug`). Never climb more than one folder (`../../`): lint enforces this.
- Order: Node built-ins, external packages, `@folix/*`, `@/`, relative. One blank line between groups.
- Type-only imports use the inline `type` keyword: `import { type Database } from '@folix/db'`. Lint enforces this.
- Never import a server module into a client component. Server-only modules start with `import 'server-only'`, which turns a mistake into a build error.

## 3. File layout, top to bottom

1. `'use client'` or `'use server'` or `import 'server-only'`, when needed
2. Imports
3. Types (props first)
4. Module constants
5. The main export
6. Private sub-components and helpers

## 4. TypeScript

- Strict mode plus `noUncheckedIndexedAccess`, `noImplicitOverride`, `noImplicitReturns`. An array or record lookup may be `undefined`: handle it.
- **No `any`.** Unknown input is `unknown`, then narrowed with Zod or a type guard. No `as` casts to silence an error: a cast needs a one-line comment saying why it is safe.
- **No non-null `!`** except straight after a check the compiler cannot follow, with a comment.
- **Derive types, do not repeat them.** `z.infer<typeof schema>` for validated shapes, `typeof table.$inferSelect` for rows, `ReturnType`, `Parameters`, `satisfies`.
- **String unions over enums.** Handle every case in a `switch` and end with a `never` check so a new case is a compile error:

  ```ts
  default: {
    const unhandled: never = issue;
    throw new Error(`Unhandled slug issue: ${String(unhandled)}`);
  }
  ```

- `type` over `interface`. Lint enforces this.
- Prefer `readonly` arrays and `as const` for fixed data. Never mutate a function's arguments.
- No magic numbers or strings. A value with a meaning gets a named constant, next to its use or in `packages/schema/src/limits.ts` if it is a product limit.
- Dates: store and pass `Date` objects or ISO strings in UTC. Format for display only at the edge, in the user's locale. Pure functions take `now` as an argument and never call `Date.now()` themselves, so they can be tested.
- Errors: throw `Error` objects, never strings. Catch as `unknown` and narrow.
- Async: no floating promises. Every promise is awaited, returned, or explicitly handed to `void` with a comment.

## 5. Comments and documentation

- Comments say **why**, not what. The code says what.
- Exported functions, types and constants that are not obvious get a short `/** ... */` saying what they guarantee and what they do not.
- A workaround names what it works around and when it can be removed.
- No commented-out code. No `TODO` without a milestone or issue reference: `// TODO(M5): revalidate the sitemap tag here`.
- When a comment refers to a rule, link the rule file: `(docs/rules/04-backend.md, "Server actions")`.

## 6. Formatting

Prettier decides, nobody argues. Settings in `.prettierrc.json`: single quotes, trailing commas, 110 columns, LF line endings, Tailwind classes sorted by the plugin. `pnpm format` writes, `pnpm format:check` verifies, and the pre-commit hook formats staged files.
