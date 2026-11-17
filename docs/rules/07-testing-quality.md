# 07. Testing and quality

## 1. The quality gate

`pnpm check` must pass before any work is called done and before every commit that goes into a pull request. It runs:

| Step         | Command             | Catches                                         |
| ------------ | ------------------- | ----------------------------------------------- |
| Format       | `pnpm format:check` | Formatting drift                                |
| Em-dash scan | `pnpm check:dashes` | Em-dashes in any text file                      |
| Lint         | `pnpm lint`         | Rule violations (naming, exports, colours, env) |
| Typecheck    | `pnpm typecheck`    | Type errors, including typed routes             |
| Tests        | `pnpm test`         | Broken behaviour                                |

CI runs the same gate, checks that migrations match the schema, and builds the app. A red CI is never merged.

Do not weaken the gate to pass it. No `eslint-disable` without a comment saying why on the same line. No `@ts-ignore` (use `@ts-expect-error` with a reason, and only as a last resort). No skipped tests left behind.

## 2. What gets which test

| Code                                                                 | Test                                                                   |
| -------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Pure rules: slug rules, limits, lock merge, gap detection, redirects | **Unit tests** (Vitest). Required, with the edge cases below.          |
| Zod schemas                                                          | Unit tests for what they accept and what they reject                   |
| Query functions, transactions, constraints                           | **Integration tests** against a real Postgres, from Milestone 3        |
| Server actions                                                       | Integration tests: unauthenticated, not the owner, invalid, happy path |
| AI code                                                              | Unit tests for pure parts, recorded fixtures for model calls           |
| The main journeys: sign in, intake to publish, edit and republish    | **End-to-end tests** (Playwright), from Milestone 5                    |
| Templates                                                            | Render tests with thin and rich fixture content                        |
| Visual polish, motion, real devices                                  | Manual checklist (section 5)                                           |

- **Tests sit next to the code:** `slug.ts` and `slug.test.ts`.
- **Test behaviour, not implementation.** A refactor that keeps behaviour should not break a test.
- **A bug fix starts with a failing test** that reproduces the bug.
- Test names read as sentences: `it('rejects reserved slugs')`.
- Tests are independent and can run in any order. No shared mutable state, no dependence on the real clock (pass `now` in), no network.
- Do not chase a coverage number. Cover the rules that would hurt if wrong: money (AI usage), limits, ownership, locks, publishing, slugs, deletion.

## 3. The edge-case checklist

Walk through this for every change. Each case that lives in pure logic gets a test. The rest go in the manual check.

**Data**

- Empty, one, and very many: no projects, one portfolio, two portfolios (the limit), a profile with 40 projects.
- Limits at the boundary: the minimum, the maximum, one past the maximum.
- Long and odd text: a 200-character name, a single unbroken 500-character word, emoji, right-to-left text, accented characters, leading and trailing spaces, only spaces.
- Missing optional fields: no photo, no links, no dates, no outcome.
- Old data: records saved before this feature or with an older content shape.

**People and permissions**

- Signed out, session expired mid-action, signed in as someone else.
- A record id that belongs to another user. A record that was deleted.
- Two tabs, or two devices, editing the same thing.

**Actions**

- Double click, double submit, pressing Enter repeatedly.
- Back button, refresh, opening a deep link directly, on every step.
- The same request arriving twice (retry after a timeout).
- Two requests racing: claiming the same slug, creating a third portfolio.

**Failures**

- Network drops mid-action. Slow network (test with throttling).
- The database, the AI provider, storage or email is down or slow.
- Partial success: the upload worked but the extraction failed.
- A model reply that is invalid, empty, too long, or a refusal.

**Product rules**

- A locked field is never changed by regenerate, rewrite or template switch.
- Nothing appears in generated copy that is not in the profile.
- Edits change the draft only. The public page changes only on Publish.
- A reserved, held or taken slug cannot be claimed. An old slug redirects for 30 days.
- The third portfolio is refused on the server.

**Interface**

- 320px, 360px, 768px, 1440px wide. 200% zoom. Largest system font.
- Light and dark schemes.
- Keyboard only. A screen reader reads the page in a sensible order.
- Reduced motion on.

## 4. Definition of done

A piece of work is done when all of these are true:

1. It does what the plan says, including the failure paths, not only the happy path.
2. `pnpm check` passes, and `pnpm build` passes when routes, config or dependencies changed.
3. The edge-case checklist was walked through, and logic cases have tests.
4. Every new server action and route handler validates input and authorises on the server.
5. Every new piece of UI has its loading, empty, error and pending states, and passes the accessibility rules.
6. It was tried in a real browser at phone and desktop width.
7. Schema changes have a committed migration. New env variables are in every place they need to be.
8. Docs are updated: STATUS.md when a milestone moves, DECISIONS.md for a major decision, the rules when a rule changed.
9. No leftovers: no `console.log`, no commented-out code, no unused files, no unreferenced TODOs.

Report honestly. If something was skipped or could not be verified (for example, no database available to test sign-in), say so in the PR and in STATUS.md.

## 5. Manual check before a milestone closes

- Click through every screen the milestone touched, as a new user and as a returning user.
- Repeat on a phone-sized viewport and with the keyboard only.
- Try to break it: the edge cases above that automation does not cover.
- Check both colour schemes.
- Run a Lighthouse pass on any public page that changed and compare against the budgets in [03-frontend.md](03-frontend.md).

## 6. Code review

Reviewers (human or AI) check, in this order: is it correct, is it safe (auth, validation, data), does it follow the plan and the two product rules, are edge cases handled, does it fit the architecture and conventions, is it as simple as it can be. Style is Prettier's job, not the reviewer's.
