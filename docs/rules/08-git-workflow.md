# 08. Git workflow

## 1. Branches

- **`main` is the trunk** and is always releasable. Production deploys from `main`.
- Work happens on short-lived branches cut from `main`: `<type>/<short-kebab-description>`, for example `feat/form-intake`, `fix/slug-redirect-loop`, `docs/rules`.
- One branch does one thing. A milestone is several small branches, not one large one.
- Rebase on `main` to stay current. Never force-push a branch someone else is working on, and never force-push `main`.
- Every branch gets a Vercel preview deploy. Check the preview before asking for review.

## 2. Commits

[Conventional Commits](https://www.conventionalcommits.org), enforced by commitlint on the `commit-msg` hook:

```
<type>(<scope>): <Subject in sentence case, imperative, no full stop>
```

| Type       | Use for                              |
| ---------- | ------------------------------------ |
| `feat`     | A new capability for the user        |
| `fix`      | A bug fix                            |
| `refactor` | A code change that keeps behaviour   |
| `perf`     | A change that makes something faster |
| `test`     | Tests only                           |
| `docs`     | Documentation only                   |
| `style`    | Formatting only                      |
| `build`    | Build system or dependencies         |
| `ci`       | CI configuration                     |
| `chore`    | Housekeeping that fits nothing above |
| `revert`   | Reverting an earlier commit          |

Scopes: `web`, `schema`, `db`, `ai`, `templates`, `tooling`, `docs`, `ci`, `deps`, `repo`.

Examples:

```
feat(schema): Add portfolio content schema with lockable text fields
fix(web): Keep the email field value when the magic link request fails
build(deps): Update drizzle-orm to 0.46
```

- One logical change per commit. Refactoring and behaviour changes go in separate commits.
- The body, when needed, says why, not what. Reference the milestone: `Milestone 3`.
- Never commit secrets, `.env` files, build output or `node_modules`.
- The pre-commit hook formats staged files. Do not bypass hooks (`--no-verify`): fix the cause.
- No em-dashes in commit messages.

## 3. Pull requests

- Small: aim for under about 400 changed lines, not counting generated files and lockfiles.
- Fill in the template: what and why, how to check it, the checklist.
- CI must be green. Review comments are resolved or answered before merging.
- **Squash merge** into `main`, with a Conventional Commits title. The branch is deleted after merge.
- A PR that changes the schema includes the migration. A PR that takes a major decision includes the DECISIONS.md line.

## 4. Releases and deploys

- Every merge to `main` deploys to production through Vercel. Migrations run in the deploy pipeline before the new code serves traffic, and are backward compatible with the previous code ([04-backend.md](04-backend.md)).
- Risky features ship behind an environment flag and are switched on separately from the deploy.
- **Rollback** is a redeploy of the previous build in Vercel. Because migrations are backward compatible, a rollback never needs a database rollback.
- From launch (Milestone 9), tag releases `vMAJOR.MINOR.PATCH` and keep a short changelog: MINOR for features, PATCH for fixes.

## 5. Dependencies

- Add with `pnpm add <pkg> --filter <workspace>`. Shared versions go in the catalog in `pnpm-workspace.yaml` and are referenced as `catalog:`.
- Update in dedicated PRs (`build(deps): ...`), one concern at a time: patch and minor updates together, each major update alone with its changelog read.
- After updating a framework (Next.js, React, Tailwind, Drizzle, Better Auth, the AI SDK), read its upgrade notes and re-run the manual check.

## 6. What never goes into git

Secrets and `.env` files, user data or real CVs (use invented fixtures), large binaries, generated build output, editor settings other than the shared `.vscode` files.
