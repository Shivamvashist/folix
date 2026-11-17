# 06. Security and privacy

Folix stores CVs, publishes pages on a shared domain and spends money per AI call. Each of those is an attack surface. These rules are the minimum.

## 1. Input

- **All input is untrusted:** form fields, server action arguments, route params, search params, headers, cookies, uploaded files, model output, webhook bodies. Parse with Zod at the boundary, then work with the parsed value only.
- Validate type, length, format and range. Every string has a maximum length.
- IDs from the client are identifiers to look up with an ownership filter, never proof of access.
- Reject unknown keys on objects that are written to the database (`z.strictObject`), so a client cannot set `userId`, `status` or `locked` fields it should not control.

## 2. Authorisation

- Every server action, route handler and data function that touches user data authorises itself ([04-backend.md](04-backend.md)). UI checks only hide things.
- Ownership is part of the query. Someone else's record returns `notFound`.
- Admin abilities (takedown) are a separate, explicit check on a role stored server-side. Never a hidden URL or a client flag.

## 3. Output and rendering

- **User content is rendered as text.** React escapes it. `dangerouslySetInnerHTML` is forbidden on anything a user or a model wrote.
- **No custom HTML, CSS or scripts in portfolios.** Themes are a fixed set of tokens the user picks from.
- **Links are sanitised before saving and before rendering:** only `https:`, `http:` and `mailto:` schemes. `javascript:`, `data:` and anything else is rejected. External links open with `rel="noopener noreferrer"`, and links on public portfolios add `nofollow ugc`.
- Structured data (JSON-LD) is built with `JSON.stringify` and escaped for `<` so content cannot close the script tag.
- Server responses never include fields the client does not need: no password hashes, tokens, internal flags or other users' data.

## 4. Secrets

- Secrets live in environment variables, validated in `env.ts`. Never in the repo, in a client bundle, in a log, in an error message or in a URL.
- `.env*` files are git-ignored. Only `.env.example`, with no values, is committed.
- A secret that was committed, pasted in chat or logged is treated as leaked: rotate it.
- Use separate keys per environment. Production keys are never used locally.

## 5. Personal data

- **Collect only what the product needs.** A CV may contain a phone number, home address, date of birth or ID numbers. These are not copied into the public page by default, and `contact` settings decide which channels are shown.
- **The uploaded CV file** is stored privately (no public URL), accessed only through short-lived signed URLs for its owner, and can be deleted by the user at any time. Deleting it removes the object from storage, not only the database row.
- **Account deletion is complete:** profile, portfolios, slugs, uploaded files, sessions and analytics tied to the account. Database rows cascade from `users`; storage objects are deleted by the same operation, and the operation can be re-run safely if it fails halfway.
- Contact details are never exposed to visitors unless the owner chose to show them. The contact form forwards messages without revealing the owner's email.
- Analytics on public pages store no personal data about visitors: no raw IP addresses, no cross-site identifiers. Country and referrer are enough.
- Never log personal content ([04-backend.md](04-backend.md), "Errors and logging").

## 6. Uploads

- Validate on the server: allowed types by content sniffing (not only the file extension or the `Content-Type` header), maximum size, maximum page count for CVs.
- Store under a generated key, never the user's filename. Keep the original name only as metadata, and sanitise it before showing it.
- Images are re-encoded and resized on upload, which also strips metadata such as GPS location.
- Uploaded files are never served from the app's own origin as HTML or with a type the browser might execute.
- Uploads require a signed-in user (or a rate-limited anonymous session) and count against a per-user quota.

## 7. Public pages and abuse

- Free public URLs attract spam, phishing and impersonation. Every portfolio page has a **report link**, and there is a **takedown switch** that unpublishes a portfolio at once.
- **Slugs:** the reserved list blocks app routes, roles and brand names; a released slug is held for 30 days; slug changes are rate limited per user. Every new top-level app route is added to the reserved list (a test enforces this).
- A per-portfolio setting hides the page from search engines (`noindex`).
- The contact form has spam protection (rate limit plus a challenge or honeypot) and never becomes an open mail relay: fixed recipient, fixed subject format, length limits.
- Public endpoints (events, contact, report) are rate limited by IP.

## 8. Web platform defences

- Security headers are set for every response in `next.config.ts` (HSTS, `nosniff`, frame denial, referrer policy, permissions policy). A Content Security Policy is added at Milestone 9, before launch.
- Mutations happen through server actions (which check origin) or `POST` handlers. No state change on `GET`.
- Cookies are HTTP-only, secure and same-site.
- Redirect targets from user input go through `getSafeRedirectPath()`.

## 9. Dependencies and supply chain

- Add a dependency only when needed ([02-architecture.md](02-architecture.md)). Prefer well-maintained packages with few transitive dependencies.
- `pnpm-lock.yaml` is committed and CI installs with `--frozen-lockfile`.
- Install scripts run only for packages listed in `onlyBuiltDependencies`.
- Review dependency updates like code. Run `pnpm audit` before each release and act on high-severity findings.

## 10. When something goes wrong

- A suspected leak or breach: rotate the affected secrets first, then investigate.
- Keep the takedown switch, account deletion and secret rotation working and tested. They are the tools you need on a bad day.
