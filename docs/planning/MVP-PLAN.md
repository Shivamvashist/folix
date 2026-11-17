# Folix MVP plan

17 Nov 2026. Source: [../product/PLAN.md](../product/PLAN.md). Rules: [../rules/README.md](../rules/README.md). Live progress: [STATUS.md](STATUS.md).

## 1. Summary

The MVP is the full v1 flow from the product plan: a person gives their career details (form, CV or AI interview), Folix writes a portfolio from them, the person edits it and publishes it at `/<slug>`. It is built as nine milestones in one Next.js app with four workspace packages. Milestone 1 (the foundation) is built. The form path is built end to end first (Milestones 2 to 5) so there is a working, publishable product before the other two intake paths and extra templates are added. The main trade-off: no separate backend service and no background job system in the MVP, which keeps the build small but means every AI call must finish within one streamed request.

## 2. Scope

**In scope (MVP)**

- Sign-in with Google, GitHub and email magic link.
- One master profile per user. Three intake paths into it: quick form, CV upload, AI interview.
- Gap check, streamed AI generation, inline editing, section reorder and hide, theme controls, section-level rewrite, field locking.
- Draft and published snapshot, slug claim and change with a 30-day hold, a 2-portfolio limit, role-targeted second portfolio.
- Four templates with lossless switching.
- Public pages with social image, SEO metadata, structured data, search-hide toggle, report link.
- Basic analytics, AI usage limits, contact form, account and data deletion, privacy policy and terms, landing page.

**Out of scope (after MVP, from the plan's "later" list)**

Resume PDF export, GitHub import, job-specific private versions, "ask my portfolio" chat, voice answers, custom domains, freshness nudge emails, payments and the paid tier.

**Assumptions**

- First audience is developers (open decision 1, recommendation taken as the working default).
- URLs are path style, `/<slug>`, on one domain.
- Everything is free during the MVP. Limits exist for cost control, not for pricing.
- English only. No internationalisation layer.
- A request can stream for up to the platform's function limit, which is enough for one generation.

## 3. Current state

Milestone 1 is built and verified (`pnpm check` and `pnpm build` pass). What exists and will be reused:

| Piece                             | Where                                                                                                     |
| --------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Workspace, tooling, CI            | `package.json`, `turbo.json`, `pnpm-workspace.yaml`, `tooling/`, `.github/workflows/ci.yml`               |
| Env validation                    | `apps/web/src/env.ts`                                                                                     |
| Database client and auth tables   | `packages/db/src/client.ts`, `packages/db/src/schema/auth.ts`, `packages/db/migrations/`                  |
| Auth (server)                     | `apps/web/src/server/auth/auth.ts`, `session.ts` (`getCurrentUser`, `requireUser`)                        |
| Auth (client and routes)          | `apps/web/src/lib/auth-client.ts`, `apps/web/src/app/api/auth/[...all]/route.ts`                          |
| Slug rules, reserved list, limits | `packages/schema/src/slug.ts`, `limits.ts` (tested)                                                       |
| Server action result shape        | `apps/web/src/lib/action-result.ts`                                                                       |
| Routes and site config            | `apps/web/src/config/routes.ts`, `site.ts`                                                                |
| Design tokens                     | `apps/web/src/app/globals.css`                                                                            |
| UI primitives                     | `apps/web/src/components/ui/` (button, input, label, badge, separator)                                    |
| Shared components                 | `components/shared/link-button.tsx`, `components/layout/container.tsx`, `section-heading.tsx`             |
| Pages                             | Landing `app/(marketing)/page.tsx`, login `app/(auth)/login/page.tsx`, dashboard shell `app/app/page.tsx` |
| Empty packages, wired in          | `packages/ai`, `packages/templates`                                                                       |

Not yet verified against real services: sign-in end to end, because no database or OAuth keys were available when Milestone 1 was built. See STATUS.md, "To verify".

## 4. Approach

**One profile, many views.** The master profile holds facts. A portfolio holds written copy generated from those facts plus a template and theme. This split is what makes template switching, the second portfolio and later exports cheap.

**Core decisions and the alternatives rejected**

| Decision                                                                           | Rejected alternative, and why                                                                         |
| ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Portfolio content is one JSONB document validated by a Zod schema                  | Normalised tables per section: many joins, a migration for every content change, harder for AI output |
| Locks are stored per field and enforced by a merge function in code                | Asking the model to leave fields alone: not a guarantee                                               |
| Published state is a full snapshot (content, template, theme)                      | A `published` flag on live data: every keystroke would change the public page                         |
| The 2-portfolio limit and slug claims are enforced in transactions and constraints | UI-only or check-then-insert: two requests at once would both pass                                    |
| AI output streams over a route handler, saved once at the end                      | Background jobs with polling: more moving parts than the MVP needs                                    |
| The form path is built end to end before CV and interview                          | All three intake paths first: nothing publishable for a long time                                     |

## 5. Design

### 5.1 Data model

All tables: `id` (UUID, database-generated, except auth tables), `created_at`, `updated_at` (`timestamptz`). Every foreign key column is indexed. User-owned rows cascade on user deletion.

| Table                                            | Columns (beyond id and timestamps)                                                                                                                                                                                                                  | Constraints and indexes                                                                                       | Milestone |
| ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | --------- |
| `users`, `sessions`, `accounts`, `verifications` | Owned by the auth library                                                                                                                                                                                                                           | Built                                                                                                         | 1 (done)  |
| `profiles`                                       | `user_id`, `content` JSONB (`ProfileContent`)                                                                                                                                                                                                       | `user_id` unique, FK cascade                                                                                  | 3         |
| `portfolios`                                     | `user_id`, `slug` (null until claimed), `target_role` (null), `template_id`, `theme` JSONB, `draft_content` JSONB, `published_snapshot` JSONB (null), `status`, `published_at` (null), `is_search_hidden` (default false), `slug_changed_at` (null) | `slug` unique, FK cascade, index `user_id`, check `status in ('draft','published','unpublished','takenDown')` | 2, 5      |
| `slug_history`                                   | `slug`, `portfolio_id` (null on portfolio delete), `user_id`, `released_at`, `hold_until`                                                                                                                                                           | index `slug`, index `hold_until`                                                                              | 5         |
| `intake_sessions`                                | `user_id`, `mode`, `status`, `messages` JSONB, `extracted` JSONB (null), `asset_id` (null)                                                                                                                                                          | FK cascade, index `user_id`, checks on `mode` and `status`                                                    | 3, 6, 7   |
| `assets`                                         | `user_id`, `kind`, `storage_key`, `content_type`, `size_bytes`, `original_name`                                                                                                                                                                     | `storage_key` unique, FK cascade, index `user_id`, check on `kind`                                            | 6         |
| `ai_usage`                                       | `user_id` (set null on delete), `feature`, `model`, `input_tokens`, `output_tokens`, `duration_ms`, `outcome`                                                                                                                                       | index (`user_id`, `created_at`)                                                                               | 3         |
| `page_events`                                    | `portfolio_id`, `type`, `target` (null), `referrer_host` (null), `country` (null), `day`                                                                                                                                                            | FK cascade, index (`portfolio_id`, `day`)                                                                     | 9         |
| `reports`                                        | `portfolio_id`, `reason`, `details`, `status`                                                                                                                                                                                                       | FK cascade, index `status`                                                                                    | 9         |

Notes:

- `published_snapshot` is `{ content, templateId, theme }`. The product plan lists `published_content` only; the snapshot also needs the template and theme, or a draft theme change would restyle the live page.
- `reports` is a ninth table, added to the plan's eight, because the report link needs somewhere to write.
- Slug availability is: no row in `portfolios` with that slug, and no `slug_history` row with that slug and `hold_until` in the future (unless it was released by the same portfolio).

### 5.2 Content shapes (`packages/schema`)

```ts
/** Every AI-writable text field. A user edit sets source 'user' and locked true. */
type AiText = { text: string; source: 'ai' | 'user'; locked: boolean };

type Link = { label: string; url: string }; // url: https, http or mailto only

/** The master profile: facts as given or extracted. No generated copy. */
type ProfileContent = {
  version: 1;
  basics: {
    name: string;
    role: string;
    location?: string;
    email?: string;
    photoAssetId?: string;
    links: Link[];
  };
  experience: {
    id: string;
    company: string;
    role: string;
    startDate: string;
    endDate: string | null;
    notes: string;
  }[];
  projects: {
    id: string;
    title: string;
    role: string;
    problem: string;
    actions: string;
    outcome: string;
    stack: string[];
    links: Link[];
    imageAssetIds: string[];
  }[];
  skills: { group: string; items: string[] }[];
  education: { id: string; school: string; qualification: string; startDate?: string; endDate?: string }[];
  extras: {
    awards: string[];
    writing: Link[];
    talks: Link[];
    testimonials: { quote: string; author: string }[];
  };
};

type SectionId = 'about' | 'experience' | 'projects' | 'skills' | 'education' | 'extras' | 'contact';

/** A portfolio: written copy plus presentation choices. */
type PortfolioContent = {
  version: 1;
  basics: {
    name: string;
    headline: AiText;
    bio: AiText;
    location?: string;
    photoAssetId?: string;
    links: Link[];
  };
  experience: {
    id: string;
    company: string;
    role: string;
    startDate: string;
    endDate: string | null;
    highlights: AiText[];
  }[];
  projects: {
    id: string;
    title: AiText;
    role: string;
    problem: AiText;
    approach: AiText;
    outcome: AiText;
    stack: string[];
    links: Link[];
    imageAssetIds: string[];
  }[];
  skills: { group: string; items: string[] }[];
  education: ProfileContent['education'];
  extras: ProfileContent['extras'];
  contact: { showEmail: boolean; showForm: boolean };
  sections: { id: SectionId; isVisible: boolean }[]; // array order is display order
};

type Theme = { accent: AccentId; fontPair: FontPairId }; // fixed sets, never free values
```

- Item `id`s are stable across regeneration, so the merge can match old and new items.
- `version` lets a later change migrate stored documents on read.
- Phone numbers and street addresses have no field: they cannot reach the public page.
- Every string has a maximum length in the Zod schema.

### 5.3 Server contract

Server actions return `ActionResult<T>` (`apps/web/src/lib/action-result.ts`). All require a signed-in user and check ownership unless marked public.

| Action (file under `apps/web/src/server/`) | Input                                | Returns                 | Errors beyond `unauthenticated`, `validation`       | Milestone |
| ------------------------------------------ | ------------------------------------ | ----------------------- | --------------------------------------------------- | --------- |
| `profile/save-profile.action.ts`           | `{ content: ProfileContent }`        | `void`                  |                                                     | 3         |
| `portfolio/create-portfolio.action.ts`     | `{ targetRole?: string }`            | `{ portfolioId }`       | `limitReached` (already 2)                          | 3         |
| `portfolio/save-draft.action.ts`           | `{ portfolioId, patch: DraftPatch }` | `{ updatedAt }`         | `notFound`, `conflict` (stale `updatedAt`)          | 4         |
| `portfolio/update-theme.action.ts`         | `{ portfolioId, theme }`             | `void`                  | `notFound`                                          | 4         |
| `portfolio/set-field-lock.action.ts`       | `{ portfolioId, path, locked }`      | `void`                  | `notFound`                                          | 4         |
| `portfolio/claim-slug.action.ts`           | `{ portfolioId, slug }`              | `{ slug }`              | `notFound`, `conflict` (taken, held), `rateLimited` | 5         |
| `portfolio/publish-portfolio.action.ts`    | `{ portfolioId }`                    | `{ slug, publishedAt }` | `notFound`, `conflict` (no slug)                    | 5         |
| `portfolio/unpublish-portfolio.action.ts`  | `{ portfolioId }`                    | `void`                  | `notFound`                                          | 5         |
| `portfolio/delete-portfolio.action.ts`     | `{ portfolioId }`                    | `void`                  | `notFound`                                          | 5         |
| `portfolio/switch-template.action.ts`      | `{ portfolioId, templateId }`        | `void`                  | `notFound`                                          | 8         |
| `assets/delete-asset.action.ts`            | `{ assetId }`                        | `void`                  | `notFound`                                          | 6         |
| `account/delete-account.action.ts`         | `{ confirmation: string }`           | `void`                  |                                                     | 9         |

Route handlers (JSON error shape `{ error: { code, message } }`):

| Route                | Method | Auth   | Body                                        | Response                                       | Milestone |
| -------------------- | ------ | ------ | ------------------------------------------- | ---------------------------------------------- | --------- |
| `/api/ai/generate`   | POST   | User   | `{ portfolioId }`                           | Stream of partial `PortfolioContent`           | 3         |
| `/api/ai/rewrite`    | POST   | User   | `{ portfolioId, path, tone }`               | Stream of text. Not saved until accepted.      | 4         |
| `/api/ai/interview`  | POST   | User   | `{ sessionId, answer }`                     | Stream of the next question, or `done`         | 7         |
| `/api/uploads`       | POST   | User   | `{ kind, contentType, sizeBytes }`          | `{ assetId, uploadUrl }` (signed, short-lived) | 6         |
| `/api/ai/extract-cv` | POST   | User   | `{ assetId }`                               | `{ sessionId, extracted: ProfileContent }`     | 6         |
| `/api/events`        | POST   | Public | `{ slug, type, target? }`                   | 204                                            | 9         |
| `/api/contact`       | POST   | Public | `{ slug, name, email, message, challenge }` | 204                                            | 9         |
| `/api/report`        | POST   | Public | `{ slug, reason, details }`                 | 204                                            | 9         |

All AI routes check the daily allowance first and return 429 with code `limitReached` when it is used up. All public routes are rate limited by IP.

### 5.4 Screens

| Path                             | Screen                                         | Milestone               |
| -------------------------------- | ---------------------------------------------- | ----------------------- |
| `/`                              | Landing page                                   | 1 (done), finished in 9 |
| `/login`                         | Sign in                                        | 1 (done)                |
| `/app`                           | Dashboard: portfolios (0 to 2), create, status | 1 shell, 3              |
| `/app/intake`                    | Choose a path: form, CV, interview             | 3                       |
| `/app/intake/form`               | Quick form, multi-step, saved as you go        | 3                       |
| `/app/intake/cv`                 | Upload, then confirm extracted details         | 6                       |
| `/app/intake/interview`          | Chat intake, resumable                         | 7                       |
| `/app/intake/gaps`               | Gap check: answer or skip                      | 3                       |
| `/app/portfolios/[id]`           | Editor with live preview, generation stream    | 3, 4                    |
| `/app/portfolios/[id]/publish`   | Slug claim, publish, search-hide, unpublish    | 5                       |
| `/app/portfolios/[id]/analytics` | Views, referrers, link clicks                  | 9                       |
| `/app/settings`                  | Account, uploaded files, delete account        | 9                       |
| `/[slug]`                        | Public portfolio                               | 2, 5                    |
| `/privacy`, `/terms`             | Legal pages                                    | 9                       |

## 6. Milestones

Each milestone ends in something you can click through, passes `pnpm check`, and updates STATUS.md. Sizes are relative: S is a day or two of focused work, M about a week, L more than a week.

### Milestone 1. Foundation (done)

Monorepo, Next.js, Tailwind, shadcn/ui, Drizzle, auth, CI, design system, landing page, login, dashboard shell, rules and docs. Detail in section 3.

**Left to verify once keys exist:** see STATUS.md.

### Milestone 2. Schema and first template (M)

Goal: seed data renders as a real portfolio at `/<slug>`.

| #   | Step                                                                                           | Files                                                              | Verify                                                            |
| --- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | ----------------------------------------------------------------- |
| 1   | Write `AiText`, `Link`, `ProfileContent`, `PortfolioContent`, `Theme` schemas with max lengths | `packages/schema/src/content/*.ts` (new)                           | Unit tests: accepts fixtures, rejects bad links and overlong text |
| 2   | Fixtures: a rich profile, a thin profile (student), edge-case content                          | `packages/schema/src/fixtures/*.ts` (new)                          | Fixtures parse                                                    |
| 3   | `portfolios` table (all columns from 5.1) and migration                                        | `packages/db/src/schema/portfolios.ts` (new), `migrations/`        | `pnpm db:generate` clean, `pnpm db:migrate` applies               |
| 4   | Queries: `getPublishedPortfolioBySlug`                                                         | `packages/db/src/queries/portfolios.ts` (new)                      | Integration test (set up the test database here)                  |
| 5   | Theme tokens (accent set, font pairs) and the template contract and registry                   | `packages/templates/src/theme.ts`, `registry.ts`, `types.ts` (new) | Typecheck                                                         |
| 6   | Template 1, "Minimal": all sections, responsive, accessible                                    | `packages/templates/src/minimal/` (new)                            | Render tests with rich and thin fixtures                          |
| 7   | Public route: load snapshot, render template, 404 when missing or not published                | `apps/web/src/app/[slug]/page.tsx` (new)                           | Seeded slug renders; unknown and reserved slugs return 404        |
| 8   | Seed script for local data                                                                     | `packages/db/src/seed.ts` (new)                                    | `pnpm db:seed` then open `/<slug>`                                |

Edge cases: no photo, one project, no experience, 200-character name, hidden sections, a section the template does not support, a snapshot that fails schema parsing (log and 404, never a broken page).

Done when: a seeded portfolio renders at its slug at 320px and 1440px, in both schemes, and passes a Lighthouse check within budget.

### Milestone 3. Form intake and generation (L)

Goal: a signed-in user fills the form and watches a draft portfolio being written.

| #   | Step                                                                                               | Files                                                                   | Verify                                                         |
| --- | -------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- | -------------------------------------------------------------- |
| 1   | `profiles`, `intake_sessions`, `ai_usage` tables and queries                                       | `packages/db/src/schema/`, `queries/`                                   | Integration tests                                              |
| 2   | Create-portfolio rule with the 2-portfolio limit in a transaction                                  | `apps/web/src/server/portfolio/create-portfolio.ts` (new), `.action.ts` | Test: two parallel creates at count 1 give exactly one success |
| 3   | Intake chooser and multi-step form (basics, experience, projects, links), saved per step           | `apps/web/src/app/app/intake/`, `components/intake/` (new)              | Refresh mid-form keeps data                                    |
| 4   | Gap detection as a pure function: thin or missing outcome, numbers, role                           | `packages/schema/src/gaps.ts` (new)                                     | Unit tests on fixtures                                         |
| 5   | Gap check screen: answer or skip                                                                   | `apps/web/src/app/app/intake/gaps/`                                     | Answers land in the profile                                    |
| 6   | AI wrapper: provider setup, usage logging, timeout, allowance check                                | `packages/ai/src/client.ts`, `usage.ts` (new)                           | Unit test with a fake model                                    |
| 7   | Generation prompt and `generatePortfolio(profile, options)` returning validated `PortfolioContent` | `packages/ai/src/prompts/generate.ts`, `generate.ts` (new)              | Fixture test; hand evaluation for invented facts               |
| 8   | Lock-aware merge, pure                                                                             | `packages/schema/src/merge.ts` (new)                                    | Unit tests: every locked field survives byte for byte          |
| 9   | `/api/ai/generate` streaming route; save once on completion                                        | `apps/web/src/app/api/ai/generate/route.ts` (new)                       | Stream renders; a failed stream leaves the old draft           |
| 10  | Editor page, read-only preview with the stream                                                     | `apps/web/src/app/app/portfolios/[id]/`                                 | Click through form to preview                                  |
| 11  | Dashboard lists real portfolios with status                                                        | `apps/web/src/app/app/page.tsx`                                         | 0, 1 and 2 portfolios all look right                           |

Edge cases: third portfolio refused on the server; allowance used up; model timeout, invalid output, refusal; closing the tab mid-stream; a profile with only a name; double click on Generate; prompt injection text inside a project description.

Done when: form to streamed draft works end to end, usage rows are written, and the invented-facts evaluation passes on all fixtures.

### Milestone 4. Editor (L)

Goal: the user can make the draft theirs.

| #   | Step                                                                           | Files                                                    | Verify                                            |
| --- | ------------------------------------------------------------------------------ | -------------------------------------------------------- | ------------------------------------------------- |
| 1   | `DraftPatch` type and pure `applyPatch` (set text, reorder, hide, set lock)    | `packages/schema/src/patch.ts` (new)                     | Unit tests                                        |
| 2   | `save-draft` action with optimistic concurrency on `updatedAt`                 | `apps/web/src/server/portfolio/save-draft.*`             | Stale save returns `conflict`                     |
| 3   | Inline text editing on the preview; edit sets `source: 'user'`, `locked: true` | `components/editor/` (new)                               | Edit, refresh, text and lock persist              |
| 4   | Autosave with debounce, visible save state, unsaved-changes warning            | `hooks/use-autosave.ts` (new)                            | Throttled network: no lost edits                  |
| 5   | Section reorder (keyboard accessible) and hide                                 | `components/editor/section-list.tsx` (new)               | Keyboard-only reorder works                       |
| 6   | Theme controls: accent and font pair from fixed sets                           | `components/editor/theme-controls.tsx`, `update-theme.*` | Preview updates; invalid ids rejected             |
| 7   | Rewrite prompt, `/api/ai/rewrite`, accept or discard UI                        | `packages/ai/src/prompts/rewrite.ts`, route, component   | Discard changes nothing; accept locks the field   |
| 8   | Lock indicator and unlock control on each field                                | `components/editor/field-lock.tsx`, `set-field-lock.*`   | Regenerate keeps locked fields, rewrites unlocked |

Edge cases: two tabs editing; very long pasted text (over the field maximum); pasting rich text (stripped to plain); rewrite on a locked field (allowed, since the user asked, result stays locked); regenerate while there are unsaved edits; undo after accept.

Done when: every edit survives refresh and regeneration, and the editor works with the keyboard alone.

### Milestone 5. Publish (L)

Goal: a real public URL that changes only on Publish.

| #   | Step                                                                                          | Files                                               | Verify                                                    |
| --- | --------------------------------------------------------------------------------------------- | --------------------------------------------------- | --------------------------------------------------------- |
| 1   | `slug_history` table; slug availability query including holds                                 | `packages/db/src/schema/`, `queries/slugs.ts` (new) | Integration tests                                         |
| 2   | Claim and change slug: unique constraint, 30-day hold, change rate limit, in one transaction  | `apps/web/src/server/portfolio/claim-slug.*`        | Two users racing for one slug: exactly one wins           |
| 3   | Publish: copy draft, template and theme into `published_snapshot`; `updateTag`                | `publish-portfolio.*`                               | Edit after publish: public page unchanged until republish |
| 4   | Public page reads the snapshot under `'use cache'` with tag `portfolio:<id>`                  | `apps/web/src/app/[slug]/page.tsx`                  | Republish updates the page at once                        |
| 5   | Old slug redirects for 30 days (permanent redirect to the new slug)                           | `apps/web/src/app/[slug]/page.tsx`                  | Old URL redirects; after the hold it returns 404          |
| 6   | Publish screen: live availability, issue messages, unpublish, delete, search-hide toggle      | `apps/web/src/app/app/portfolios/[id]/publish/`     | All slug issues show a helpful message                    |
| 7   | SEO: metadata, Person JSON-LD, generated social image, sitemap entries, `noindex` when hidden | `[slug]/opengraph-image.tsx` (new), `sitemap.ts`    | Share-preview checker shows the card                      |
| 8   | Second portfolio with `target_role`, generated from the same profile                          | `create-portfolio.*`, generation prompt             | Two portfolios, two slugs, different wording              |
| 9   | End-to-end test: sign in, form, generate, edit, publish, view                                 | `apps/web/e2e/` (new, Playwright)                   | Runs in CI                                                |

Edge cases: reserved, held, taken and malformed slugs; changing a slug back to your own old one within the hold (allowed); publishing with no slug; deleting a published portfolio (slug enters the hold); unpublished page returns 404 and leaves the sitemap; slug differing only by case.

Done when: the full form path is live end to end. **This is the first shippable product.**

### Milestone 6. CV upload (M)

| #   | Step                                                                                        | Files                                                          | Verify                                                |
| --- | ------------------------------------------------------------------------------------------- | -------------------------------------------------------------- | ----------------------------------------------------- |
| 1   | R2 wrapper: signed upload and download URLs, delete                                         | `apps/web/src/server/storage/` (new)                           | Upload and delete against a dev bucket                |
| 2   | `assets` table, `/api/uploads` with type, size and quota checks                             | `packages/db`, route                                           | Oversized and wrong-type files rejected on the server |
| 3   | Extraction: PDF sent to the model, DOCX converted to text first; output is `ProfileContent` | `packages/ai/src/extract-cv.ts`, `prompts/extract-cv.ts` (new) | Fixture CVs extract without invented fields           |
| 4   | Confirmation screen: every extracted field editable, inferred fields flagged, not skippable | `apps/web/src/app/app/intake/cv/`                              | Phone and address never reach the profile             |
| 5   | Merge into an existing profile without overwriting what the user already confirmed          | `packages/schema/src/merge-profile.ts` (new)                   | Unit tests                                            |
| 6   | Delete the uploaded CV (object and row)                                                     | `assets/delete-asset.*`, settings UI                           | Object is gone from the bucket                        |

Edge cases: scanned image PDF with no text, password-protected file, 30-page CV, non-English CV, a file that is not a CV, upload succeeded but extraction failed (file kept, retry offered), instructions hidden in the CV text.

### Milestone 7. AI interview (M)

| #   | Step                                                                             | Files                                           | Verify                             |
| --- | -------------------------------------------------------------------------------- | ----------------------------------------------- | ---------------------------------- |
| 1   | Interview state machine, pure: which question next, when to follow up, when done | `packages/ai/src/interview/state.ts` (new)      | Unit tests                         |
| 2   | Question and follow-up prompts for the developer audience; thin-profile path     | `packages/ai/src/prompts/interview.ts` (new)    | Hand evaluation with vague answers |
| 3   | `/api/ai/interview` streaming; messages saved to `intake_sessions`               | route                                           | Refresh mid-interview resumes      |
| 4   | Chat UI: accessible live region, skip a question, edit a previous answer         | `components/intake/interview/` (new)            | Keyboard and screen reader pass    |
| 5   | Convert the transcript into `ProfileContent`, then the same gap check            | `packages/ai/src/interview/to-profile.ts` (new) | Fixture transcripts                |

Edge cases: one-word answers, an answer that is a wall of text, abandoning and returning days later, hitting the allowance mid-interview (progress kept), off-topic or abusive answers.

### Milestone 8. Templates 2 to 4 and switching (M)

| #   | Step                                                                    | Files                                         | Verify                                           |
| --- | ----------------------------------------------------------------------- | --------------------------------------------- | ------------------------------------------------ |
| 1   | Templates "Bold", "Editorial", "Terminal" (open decision 6)             | `packages/templates/src/<name>/` (new)        | Render tests; accessibility and performance pass |
| 2   | Template picker with real previews of the user's own content            | `components/editor/template-picker.tsx` (new) | Switch keeps every edit and lock                 |
| 3   | `switch-template` action; unsupported sections are skipped, not deleted | `portfolio/switch-template.*`                 | Switch away and back: content identical          |

### Milestone 9. Launch readiness (L)

| #   | Step                                                                                | Verify                                                        |
| --- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| 1   | Analytics: `page_events`, `/api/events`, analytics screen                           | Views, referrers and link clicks appear; no visitor IP stored |
| 2   | Rate limits (Upstash) on AI routes and all public routes; final daily allowances    | 429 with `Retry-After`                                        |
| 3   | Report link, `reports` table, takedown switch                                       | Taken-down page returns 404 at once                           |
| 4   | Contact form with spam protection, forwarding by email                              | Owner's email never exposed                                   |
| 5   | Settings: uploaded files, export my data, delete account (rows and storage objects) | Nothing left in the database or bucket                        |
| 6   | Privacy policy and terms pages; `/privacy`, `/terms` already reserved               | Linked from footer and login                                  |
| 7   | Sentry and PostHog; funnel events `intake_started`, `generated`, `published`        | A forced error reaches Sentry                                 |
| 8   | Content Security Policy; `pnpm audit`; a pass through the security rules            | No CSP violations in normal use                               |
| 9   | Landing page final pass: real template screenshots, social image, performance       | Lighthouse within budget                                      |
| 10  | Optional: generate and preview before sign-up (see open question 3)                 | Anonymous draft is claimed on sign-up                         |

## 7. Edge cases and failure handling (cross-cutting)

| Case                                          | Handling                                                                                      |
| --------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Two requests create a third portfolio at once | Count inside a transaction that locks the user row. One fails with `limitReached`.            |
| Two users claim one slug at once              | Unique constraint. The loser gets `conflict`.                                                 |
| Model returns invalid output                  | One retry with the validation error, then a clear failure. The old draft stays.               |
| Model writes over a locked field              | Impossible to persist: the merge keeps locked fields from the previous content.               |
| Model invents a number                        | Prompt forbids it, gaps are requested instead, fixtures are evaluated on every prompt change. |
| Stream cut off mid-generation                 | Nothing is saved until a complete, validated object arrives.                                  |
| Editing in two tabs                           | Save carries the last seen `updatedAt`. A stale save returns `conflict` and offers reload.    |
| Stored content fails the current schema       | Migrate on read by `version`. If that fails, log, show a safe error, never a broken page.     |
| Upload succeeds, extraction fails             | Asset kept, retry offered, nothing written to the profile.                                    |
| Account deletion fails halfway                | The operation can be re-run safely. Storage objects are deleted before the user row.          |
| A service is down (AI, email, storage)        | Essential actions show an actionable error and keep data. Optional ones fail quietly.         |

## 8. Security and permissions

Rules: [../rules/06-security-privacy.md](../rules/06-security-privacy.md). The points that shape the design:

- Every action and route authorises itself and filters by owner. Another user's record is `notFound`.
- User and model text is rendered as text only. Links are restricted to safe schemes.
- CVs are private objects with signed, short-lived access. Phone numbers and addresses have no field to land in.
- Public endpoints are rate limited. Slugs are protected by the reserved list, the hold and a change limit.

## 9. Performance and scale

- Expected volume in the first year is small: thousands of users, at most two portfolios each. No table needs partitioning. `page_events` is the only one that grows with traffic and is indexed by (`portfolio_id`, `day`).
- Public pages are cached snapshots, revalidated by tag on publish, so traffic to portfolios does not touch the AI provider and rarely the database.
- The slow path is generation. It streams, so the user sees progress within a second or two.
- JSONB documents are small (tens of kilobytes). They are read and written whole.

## 10. Testing

Rules: [../rules/07-testing-quality.md](../rules/07-testing-quality.md).

- Unit: slug rules (done), content schemas, gaps, merge with locks, patches, interview state machine.
- Integration, real Postgres (from Milestone 2): queries, the portfolio limit under concurrency, slug claims under concurrency, ownership on every action.
- AI: recorded fixtures in CI, a hand-run evaluation set when prompts change.
- End to end (from Milestone 5): sign in, form to publish, edit and republish.

## 11. Rollout

- Deploys: every merge to `main` goes to production on Vercel. Migrations run before the new code and are backward compatible, so rollback is a redeploy of the previous build.
- Until Milestone 5 the product is not announced. Milestone 5 can go to a few invited users. Public launch follows Milestone 9.
- Watch after launch: error rate (Sentry), the funnel from `intake_started` to `published` (PostHog), daily AI spend from `ai_usage`, and reports.

## 12. Risks and open questions

**Risks**

| Risk                                                                        | Likelihood | Impact | Mitigation                                                                                                                   |
| --------------------------------------------------------------------------- | ---------- | ------ | ---------------------------------------------------------------------------------------------------------------------------- |
| Generated copy reads as generic                                             | Medium     | High   | Gap check and interview follow-ups pull specifics; evaluate prompts on fixtures; iterate at Milestone 3 before building more |
| The model invents facts                                                     | Medium     | High   | Prompt rule, gaps as data, evaluation set, user confirmation of extracted data                                               |
| AI cost from abuse                                                          | Medium     | Medium | Allowances and usage logging from Milestone 3, rate limits at Milestone 9, nothing anonymous until limits exist              |
| Editor complexity (inline editing, autosave, locks)                         | High       | Medium | Pure patch and merge functions with tests first; plain text fields only, no rich text                                        |
| Framework versions newer than most examples (Next.js 16, Tailwind 4, Zod 4) | High       | Low    | Read the bundled docs; CI catches breakage                                                                                   |
| Long generations exceed the function time limit                             | Low        | Medium | Stream; cap input size; if it happens, move generation to a worker (the plan's Hono option)                                  |
| Spam and phishing on public pages                                           | Medium     | High   | Report link, takedown, no custom HTML, link sanitising, reserved slugs                                                       |

**Open questions**

| #   | Question                                           | Who decides | Recommendation                                                                                              | Needed by   |
| --- | -------------------------------------------------- | ----------- | ----------------------------------------------------------------------------------------------------------- | ----------- |
| 1   | First audience: developers, designers or students? | You         | Developers. It shapes the interview questions and Template 1.                                               | Milestone 2 |
| 2   | Which model for writing and for extraction?        | You         | Latest Claude Sonnet for writing; try a smaller, cheaper Claude model for extraction and compare.           | Milestone 3 |
| 3   | Generate and preview before sign-up?               | You         | Defer to the end of Milestone 9. It adds anonymous sessions and abuse surface, and needs rate limits first. | Milestone 9 |
| 4   | Daily AI allowance per user                        | You         | Start at 5 full generations and 30 rewrites per day, then tune from `ai_usage`.                             | Milestone 3 |
| 5   | Domain and TLD                                     | You         | Buy it before Milestone 5: slugs, OAuth callbacks and email sending all depend on it.                       | Milestone 5 |
| 6   | Template styles 2 to 4                             | You         | Bold, Editorial, Terminal (the last fits developers).                                                       | Milestone 8 |
| 7   | Pricing and payments                               | You         | After the MVP. Keep everything free, with limits, until then.                                               | After MVP   |
| 8   | Slug change limit                                  | You         | 3 changes per 30 days per portfolio.                                                                        | Milestone 5 |

## 13. Environments, services and what each milestone needs

| Environment | Where                        | Database                                                  | Purpose             |
| ----------- | ---------------------------- | --------------------------------------------------------- | ------------------- |
| Local       | `pnpm dev`                   | A Neon development branch                                 | Day-to-day building |
| Preview     | Vercel, one per pull request | A Neon branch per preview                                 | Review before merge |
| Production  | Vercel, from `main`          | Neon main branch                                          | Real users          |
| CI          | GitHub Actions               | A throwaway Postgres service container (from Milestone 2) | The quality gate    |

Accounts and keys to have ready **before** each milestone starts, so work is never blocked mid-way:

| Before milestone | You need                                                                                                       |
| ---------------- | -------------------------------------------------------------------------------------------------------------- |
| 2                | Neon project and `DATABASE_URL`. Google and GitHub OAuth apps (to verify sign-in). Decision on first audience. |
| 3                | Anthropic API key. Decision on model and daily allowance.                                                      |
| 5                | The domain. Vercel project connected to the repo. Resend account with the domain verified.                     |
| 6                | Cloudflare R2 bucket and token.                                                                                |
| 9                | Upstash Redis, Sentry and PostHog projects. Privacy policy and terms text.                                     |

Each new key follows the rule in [../rules/02-architecture.md](../rules/02-architecture.md), "Adding to the system", and is listed in [../engineering/environment.md](../engineering/environment.md).

## 14. Non-functional requirements

| Area          | Requirement                                                                                          |
| ------------- | ---------------------------------------------------------------------------------------------------- |
| Accessibility | WCAG 2.2 AA for the app and every template                                                           |
| Performance   | Public pages: LCP under 2.5s, CLS under 0.1, INP under 200ms on a mid-range phone                    |
| Browsers      | Last two versions of Chrome, Edge, Firefox and Safari, including iOS Safari and Android Chrome       |
| Screen sizes  | 320px wide and up                                                                                    |
| Availability  | No target promised in the MVP. Public pages keep serving from cache if the database is briefly down. |
| Data safety   | Neon point-in-time restore switched on before Milestone 5. A restore is tried once before launch.    |
| Privacy       | Account deletion removes everything. No visitor personal data in analytics.                          |
| Cost          | Every AI call logged. A daily spend figure can be read from `ai_usage` from Milestone 3.             |

## 15. How we will know the MVP works

Measured from Milestone 9, when the funnel events exist:

| Measure                                             | Why it matters                               |
| --------------------------------------------------- | -------------------------------------------- |
| Share of people who start intake and reach a draft  | Is intake too long or confusing?             |
| Share of drafts that get published                  | Is the writing good enough to put a name on? |
| Share of generated fields the user rewrites by hand | The direct measure of writing quality        |
| Median time from sign-up to publish                 | The "few minutes" promise                    |
| AI cost per published portfolio                     | Whether a free tier is affordable            |
| Reports per 1,000 published portfolios              | Abuse level                                  |

No targets are set yet: the first weeks give the baseline.

## 16. Foundations for the future

The MVP is shaped so that the features in [FUTURE-FEATURES.md](FUTURE-FEATURES.md) are additions, not rewrites. What each one stands on:

| Future feature            | What the MVP already provides                                                            | What it adds                                            |
| ------------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| Resume PDF export         | The master profile and `PortfolioContent`; templates as pure components of content       | A print template and a PDF render step                  |
| GitHub import             | Intake sessions that end in `ProfileContent`; profile merge that respects confirmed data | A fourth intake mode and a GitHub connection            |
| Job-specific version      | `target_role` and one-profile-many-portfolios; snapshots                                 | A private link type and a job-description input         |
| "Ask my portfolio" chat   | The profile as the only source of truth; AI wrapper, usage logging, rate limits          | A public chat route answering from the profile only     |
| Custom domains            | Public pages resolved by a lookup, cached by tag                                         | A domain table and host-based lookup in `proxy.ts`      |
| Paid tier                 | Limits as named constants in one file, checked on the server                             | A plan column, per-plan limits, a payments provider     |
| More templates and themes | The registry and the fixed theme token sets                                              | A folder and a registry entry each                      |
| More languages            | Copy kept out of marketing components; content as data                                   | A translation step and a locale field on the portfolio  |
| Teams or agencies         | Ownership checked in one place per query                                                 | An organisation table and a second ownership path       |
| A background worker       | AI and storage behind wrapper modules; packages with no app dependencies                 | A small worker app in `apps/` reusing the same packages |
| Content shape changes     | A `version` field on every stored document                                               | A migrate-on-read function per version                  |

The rule that keeps this true: new capabilities are new entries (a template, an intake mode, a section, a limit), never edits scattered across the app. If a planned change needs edits in many places, stop and fix the boundary first.
