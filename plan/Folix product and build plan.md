# Folix: product and build plan

Nov 17, 2026 · @Shivam

## What Folix is

Folix turns a person's career details into a published portfolio website in a few minutes. The user gives their details once, by form, CV upload or a short AI interview, and gets a written, designed, editable site at their own URL.

The core design decision: Folix stores one **master profile** of facts per user, and every portfolio is a written and styled view of that profile. This is what makes template switching, a second portfolio, resume export and later features cheap to build.

Two rules shape the product:

- **The AI never invents facts.** It rewrites, structures and sharpens what the user gave. Where detail is missing (no outcome, no numbers), it asks or marks a gap for the user to fill.
- **User edits always win.** Any field the user has edited is locked against regeneration unless they unlock it.

## Core v1 flow

1. **Intake.** The user picks one of three paths, and all three end in the same master profile:
   - Quick form: name, role, experience, projects, links.
   - CV upload: PDF or DOCX, extracted into the profile, then shown for confirmation.
   - AI interview: 8 to 12 short questions, with follow-ups when an answer is vague ("what changed because of that project?").
2. **Gap check.** Folix lists what is thin or missing and lets the user answer or skip.
3. **Generate.** The AI writes the portfolio copy from the profile: headline, bio, project write-ups, experience bullets. Output is streamed into a live preview.
4. **Edit.** The user edits text inline on the preview, reorders or hides sections, switches template, changes accent colour and font pair, and can ask the AI to rewrite any single section (shorter, more formal, more technical).
5. **Publish.** The user claims a slug and publishes. The public page is served at `folix.<tld>/<slug>`.

Publishing rules:

- Maximum 2 portfolios per user, each with its own globally unique slug.
- Edits go to a draft. The public page changes only when the user presses Publish.
- A slug can be changed if the new one is free. The old slug redirects for 30 days and stays unclaimable during that time.
- A reserved list blocks slugs such as `app`, `api`, `login`, `admin`, `pricing` and brand names.
- Let people generate and preview before signing up, and require an account only to save or publish.

## Differentiators

Most portfolio builders parse a CV into a template and stop. Folix competes on the quality of the writing and on what one profile can produce. Check the current competitors before committing to the "later" list, since this was written from general knowledge of the category.

In v1:

- **Interview that digs for specifics.** Follow-up questions pull out outcomes, numbers and the user's own role, which is what makes the copy non-generic.
- **Project case studies, not bullet lists.** Each project is written as problem, what you did, result, stack.
- **Role-targeted second portfolio.** The 2-portfolio limit becomes a feature: the same profile written for two audiences, for example "frontend engineer" and "freelance".
- **Template switch with no loss.** Content is stored separately from design, so switching keeps every edit.
- **Section-level AI rewrite** with tone options and an accept or discard step.
- **Share-ready by default.** Auto-generated social preview image, SEO metadata and Person structured data per portfolio.
- **Basic analytics.** Views, referrers and which project links got clicked.

Later, in rough priority order:

- **Resume PDF export** from the same profile, so the site and CV never drift apart.
- **GitHub import** that reads repos and READMEs and drafts project case studies.
- **Job-specific version.** Paste a job description and get a tailored private link for that application.
- **"Ask my portfolio" chat** for visitors, answering only from the profile, rate limited.
- **Voice answers** in the AI interview.
- **Custom domains** as a paid feature.
- **Freshness nudges** by email when a portfolio has not been updated in 6 months.

## Tech stack

One full-stack Next.js app in TypeScript, with no separate backend service at the start. Every piece below is something you already know or a small step from it. Versions are not pinned here: install current stable releases at setup.

| Layer | Choice | Why |
| --- | --- | --- |
| App framework | Next.js (App Router) + React | Dashboard, editor, API and fast cached public pages in one deploy |
| Styling and UI | Tailwind + shadcn/ui | Matches your skills; quick, consistent dashboard UI |
| Server logic | Server actions for mutations, route handlers for AI streaming and uploads | No second service to deploy or keep in sync |
| Database | PostgreSQL on Neon | Relational data (users, slugs, limits) plus JSONB for portfolio content |
| ORM | Drizzle | Type-safe, light, SQL-like migrations |
| Validation | Zod | One schema shared by forms, the database JSON and AI structured output |
| Auth | Better Auth (Google, GitHub, email magic link) | Lives in your own Postgres, no per-user fees |
| AI | Vercel AI SDK with a Claude model | Streaming and schema-validated structured output; provider can be swapped |
| CV parsing | Send the PDF straight to the model; convert DOCX to text with mammoth first | Avoids building a parser; handles messy layouts |
| File storage | Cloudflare R2 | Cheap S3-compatible storage for CVs and images, no egress fees |
| Rate limits | Upstash Redis | Per-user caps on AI calls and public endpoints |
| Email | Resend | Magic links and later nudges |
| Hosting | Vercel | Simplest path for Next.js, preview deploys per branch |
| Monitoring | Sentry + PostHog | Errors and product funnel (intake started, generated, published) |

Notes on the choices:

- **Why not NestJS or a separate Hono API:** v1 has one client and no heavy background work, so a second service only adds deploy and auth plumbing. If you later need long jobs (bulk GitHub import, PDF rendering), add a small Hono worker in the same repo.
- **Why Postgres and not MongoDB:** slugs need unique constraints, the 2-portfolio limit needs transactions, and JSONB already gives document-style flexibility for content.
- **Public pages:** render `/[slug]` on the server from the published snapshot, cache it, and revalidate by tag on publish.

## Data model

Eight tables cover v1. Portfolio content is JSONB validated by the shared Zod schema, so templates and the AI read and write the same shape.

| Table | Holds | Key points |
| --- | --- | --- |
| `users` (+ auth tables) | Account and login methods | Created by the auth library |
| `profiles` | The master profile, one per user | `content` JSONB: the facts, as given or extracted |
| `portfolios` | Up to 2 per user | `slug` unique, `template_id`, `theme`, `draft_content`, `published_content`, `status`, `published_at`, `target_role` |
| `slug_history` | Released slugs | Drives the 30-day redirect and hold |
| `intake_sessions` | One form, CV or interview run | `mode`, `messages`, `extracted`, `status`; lets users resume |
| `assets` | Uploaded CVs and images | Storage key, type, size, owner |
| `page_events` | Public page analytics | Portfolio, event type, referrer, country, day |
| `ai_usage` | Every AI call | User, feature, tokens; powers per-user limits and cost tracking |

Portfolio content shape:

- `basics`: name, headline, bio, location, photo, links
- `experience[]`: company, role, dates, highlights
- `projects[]`: title, your role, problem, what you did, outcome, stack, links, images
- `skills`: grouped lists
- `education[]`
- `extras`: awards, writing, talks, testimonials
- `contact`: which channels to show
- `sections`: order and visibility

Every AI-writable text field is stored as `{ text, source: "ai" | "user", locked }`. Regeneration skips locked fields, which is how user edits survive a template switch or a rewrite.

Templates are React components that take `content` and `theme` and declare which sections they support. A registry maps `template_id` to a component.

## Repo setup

Set up one repository, `folix`, as a pnpm workspace with Turborepo. A single repo lets Claude Code see the schema, templates, AI prompts and app together, so a change to the content shape updates all four in one pass.

```
folix/
  apps/
    web/                Next.js app
      app/(marketing)/  landing, pricing
      app/(auth)/       login
      app/app/          dashboard, intake, editor (signed in)
      app/[slug]/       public portfolio pages
      app/api/          AI streaming, uploads, auth, events
  packages/
    schema/             Zod schemas and types for profile and portfolio content
    db/                 Drizzle schema, migrations, queries
    templates/          template components, theme tokens, registry
    ai/                 prompts, interview logic, CV extraction, generation
  docs/
    PLAN.md             this document, exported as Markdown
  CLAUDE.md             conventions for the agent
```

Before opening Claude Code:

- [ ] Create the empty `folix` repo on GitHub and clone it
- [ ] Export this doc as Markdown to `docs/PLAN.md`
- [ ] Create a Neon project and copy the connection string
- [ ] Create an R2 bucket and API token
- [ ] Get an Anthropic API key
- [ ] Create Google and GitHub OAuth apps for login
- [ ] Put all keys in `.env.local` and keep a key-less `.env.example` in the repo

What `CLAUDE.md` should say:

- Read `docs/PLAN.md` first and build one milestone at a time, in order.
- `packages/schema` is the source of truth. Change the schema first, then db, ai and templates.
- TypeScript strict mode, no `any`. Validate every external input with Zod.
- AI prompts live only in `packages/ai`. The AI must not invent facts about a user.
- All portfolio limits and slug rules are enforced on the server, never only in the UI.
- Run typecheck, lint and tests before calling a milestone done.

## Build order

Build the form path end to end first, then add the other two intake paths on top of a working product. Each milestone should end in something you can click through.

1. **Scaffold.** Monorepo, Next.js, Tailwind, shadcn/ui, Drizzle on Neon, auth, CI with typecheck and lint.
2. **Schema and first template.** Zod content schema, one template rendering seed data at `/[slug]`.
3. **Form intake and generation.** Form to master profile, gap check, streamed AI generation into a draft portfolio.
4. **Editor.** Inline text editing, section reorder and hide, theme controls, section-level AI rewrite, field locking.
5. **Publish.** Slug claim and change, draft to published snapshot, 2-portfolio limit, caching, social image, SEO.
6. **CV upload.** Upload to R2, extraction into the profile, confirmation screen.
7. **AI interview.** Chat intake with follow-ups, resumable sessions.
8. **Templates 2 to 4 and template switching.**
9. **Launch readiness.** Analytics, AI usage limits, report link, account and data deletion, privacy policy and terms, landing page.

## Gaps to cover

These were not in the original idea and each one causes real trouble if left out.

- **Draft versus published.** Without it, every keystroke in the editor changes the live site.
- **AI cost control.** Cap generations and rewrites per user per day and log every call, or one abusive account can run up the bill.
- **Private data in CVs.** CVs carry phone numbers and home addresses. Keep these out of the public page by default, let users delete the uploaded file, and support full account deletion.
- **Abuse of public pages.** Free public URLs attract spam and phishing. Add a report link on every portfolio, allow no custom HTML or scripts, sanitise links and keep a takedown switch.
- **Slug squatting and impersonation.** Reserved list, the 30-day hold on released slugs, and a limit on how often a slug can change.
- **Thin profiles.** Students and career changers have little to list. The interview and templates need a path that leads with projects, coursework and skills.
- **Contact without exposing email.** A contact form with spam protection that forwards to the owner.
- **Search visibility control.** A per-portfolio "hide from search engines" toggle.
- **Template quality bar.** Every template must be responsive, accessible and fast, since the public page is the product.
- **Photo and image handling.** Size limits, resizing and optimisation on upload.

## Open decisions

- [ ] **First audience.** Developers, designers or students? Interview questions and templates differ for each. Recommendation: start with developers, since you know the audience and GitHub import fits later.
- [ ] **Pricing.** Recommendation: free tier with 1 portfolio and a small Folix badge; paid tier for the second portfolio, badge removal, analytics and custom domain.
- [ ] **Payments provider.** Depends on your country and where customers are; decide when the paid tier is built.
- [ ] **Domain and URL style.** Path (`folix.<tld>/<slug>`) is simplest for v1. Subdomains (`<slug>.folix.<tld>`) look more personal but add wildcard DNS and routing work.
- [ ] **Free AI allowance.** How many full generations and rewrites per user per day.
- [ ] **Template direction.** Which 3 to 4 styles to build first, for example minimal, bold, editorial, terminal-style.
