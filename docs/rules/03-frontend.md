# 03. Frontend

The public portfolio page is the product, and the editor is where users decide whether to stay. The bar is agency quality: deliberate type, consistent spacing, every state designed, nothing generic. Design tokens and visual rules are in [../design/DESIGN-SYSTEM.md](../design/DESIGN-SYSTEM.md).

## 1. Server and client components

- **Server components by default.** Add `'use client'` only when a component needs state, effects, event handlers or a browser API.
- **Push `'use client'` to the leaves.** A page stays a server component and renders a small client component for the interactive part. Do not mark a whole page as a client component to use one `onClick`.
- **Pass server data down as props**, serialisable and narrow. Send the client only the fields it renders, never a whole database row.
- **Never import from `@/server/*`, `@folix/db` or `@folix/ai` in a client component.** `server-only` makes it a build error.
- The React Compiler is on. Do not add `useMemo` or `useCallback` by reflex. Add them only where identity matters and the compiler cannot help (a context value, an effect dependency from outside React).
- Effects clean up after themselves (timers, listeners, observers, streams).

## 2. Rendering and caching (Next.js 16, Cache Components)

`cacheComponents` is on. Read `apps/web/node_modules/next/dist/docs/` before changing how a page loads data.

- **Anything that reads the request** (`cookies()`, `headers()`, the session, `searchParams`) **sits inside `<Suspense>`** with a designed fallback. Outside a boundary it is a build error.
- **Keep the static shell large.** Layout, headings and navigation render outside the boundary so the page appears at once and the personal part streams in.
- **Never read the session at the top of a layout.** It blocks every page below it. Read it in a component inside a boundary.
- **No current time during prerender.** `new Date()` or `Date.now()` in a server component outside a boundary fails the build.
- Cached reads use `'use cache'` with `cacheTag(...)`. Mutations call `updateTag(...)` with the same tag. Tags follow `entity:id`. Never put secrets or personal data in a tag or a cached function's arguments: they are stored as plain text.
- Public portfolio pages render from the published snapshot, are cached by `portfolio:<id>`, and are revalidated on publish.

## 3. Components

- **One component, one job.** If the description needs "and", split it.
- **Props are a typed contract:** `type <Name>Props`, required props first, sensible defaults, no boolean pile-ups. Prefer `variant: 'primary' | 'outline'` over `isPrimary` plus `isOutline`.
- **Composition over configuration.** Accept `children` or slots before adding a tenth prop.
- **Accept `className` on layout-level components** and merge it with `cn()` last, so a caller can adjust spacing without a new prop.
- **`components/ui/` is for shadcn/ui primitives only.** Add them with `pnpm dlx shadcn@latest add <name>` from `apps/web`. You may edit them, but keep changes small and token-based so upstream updates stay easy. Our own components go in `shared/` or a feature folder.
- **Navigation is a link, an action is a button.** `LinkButton` (or `Link`) for going somewhere, `Button` for doing something. Never an `onClick` on a `div`.
- **Internal links use `ROUTES`** and are type-checked (`typedRoutes`). No path string literals.
- **No sentences in marketing section components.** Marketing copy lives in `content/marketing.ts`. Product UI copy may sit in the component, in plain words (section 8).
- **Plan before building** any component that is not trivial. Write, in the PR or task: purpose in one line; props; variants and states (default, hover, focus, active, disabled, loading, empty, error); tokens used; keyboard behaviour and accessible name; motion and its reduced-motion behaviour.

## 4. Styling

- **Tailwind utilities and design tokens only.** No CSS modules, no inline `style` except a dynamic value that cannot be a class (a computed width, a user-chosen accent colour).
- **Colour roles, never raw colours.** `bg-background`, `text-muted-foreground`, `bg-brand`. No hex values and no arbitrary colour classes (`bg-[#123456]`) in components: lint blocks them. No Tailwind palette colours either (`bg-blue-600`, `text-gray-500`): they bypass the theme and break dark mode.
- **Spacing, radius and type from the scale.** No arbitrary pixel values when a scale step exists. An arbitrary value needs a reason (a specific optical alignment).
- **Dark mode comes from the tokens.** A component written with roles works in both schemes without `dark:` classes. Use `dark:` only for a real difference in treatment.
- **Conditional classes go through `cn()`**, never string concatenation.
- **Mobile first.** Base classes are the phone layout. Add `sm:`, `md:`, `lg:` going up.
- User-chosen portfolio themes (accent colour, font pair) are applied as CSS variables on the template root, never by generating class names.

## 5. Every state is designed

For every piece of UI that loads, saves or lists, all of these exist before the work is done:

| State         | Rule                                                                                           |
| ------------- | ---------------------------------------------------------------------------------------------- |
| Loading       | A skeleton shaped like the content, in a Suspense fallback. No layout shift when data arrives. |
| Empty         | Says what belongs here and offers the next action. Never a blank area.                         |
| Error         | Plain words, what happened and what to do. Never a raw error, stack trace or code alone.       |
| Pending       | The control shows it is working and cannot be triggered twice.                                 |
| Success       | Visible confirmation for anything not obvious from the screen changing.                        |
| Partial       | Long text, missing optional fields, one item, hundreds of items all still look right.          |
| No permission | A clear message or a redirect to sign in. Never a broken page.                                 |

Route level: every route group has an `error.tsx` path to recover, and `not-found.tsx` handles missing records.

## 6. Forms

- **One Zod schema per form, shared with the server.** The client validates for speed, the server validates for truth, both with the same schema from `@folix/schema`.
- Submit through a server action that returns `ActionResult` ([04-backend.md](04-backend.md)). Show `fieldErrors` next to their fields and the general message near the submit button.
- Every input has a visible `<Label>` tied to it, the right `type`, `inputMode` and `autoComplete`, and `aria-invalid` plus `aria-describedby` when it has an error.
- **Double submit is impossible:** the submit control is disabled while pending.
- Keep what the user typed when a submit fails. Never clear a form on error.
- Long forms (intake, editor) save drafts as the user goes and warn before losing unsaved changes.
- Validate on submit first, then on change for fields already shown as invalid. Do not shout at a user who is still typing.
- Error messages say how to fix it: "Use 3 to 30 letters, numbers or hyphens", not "Invalid slug".

## 7. Accessibility (WCAG 2.2 AA is the floor)

- **Keyboard:** everything works without a mouse, in a sensible tab order, with a visible focus ring (the `ring` token). No focus traps except in modals, which trap on purpose and return focus on close.
- **Semantics first:** real `button`, `a`, `nav`, `main`, `header`, `footer`, `ul`, headings in order (one `h1` per page). ARIA only when HTML has no element for it.
- **Names:** every control has an accessible name. Icon-only buttons get `aria-label`. Decorative icons and illustrations get `aria-hidden="true"`.
- **Sections** are labelled: `<section aria-labelledby="...">` pointing at their heading.
- **Contrast:** 4.5:1 for text, 3:1 for large text and UI boundaries, in both schemes. Check when adding or changing a token.
- **Targets:** at least 44 by 44 CSS pixels on touch screens.
- **Motion:** respect `prefers-reduced-motion` (handled globally in `globals.css`). Never convey meaning by motion or colour alone.
- **Live changes:** async results the user did not navigate to are announced (`role="status"` or `role="alert"`).
- **Images:** meaningful images have `alt` text that says what they show. User photos use the person's name.
- **Zoom:** layouts hold at 200% zoom and with large system fonts. Use `rem`, not `px`, for type.
- A "Skip to content" link is in the root layout. Every page's main region has `id="main"`.

## 8. Copy

- Plain words, short sentences, sentence case for headings and buttons. No exclamation marks, no jargon, no em-dashes.
- Buttons say what happens: "Publish portfolio", not "Submit" or "OK".
- **Marketing copy describes only what the product does.** No invented numbers, customers, quotes, ratings or awards. Sample content in illustrations is labelled as an example.
- Use the product vocabulary from [01-conventions.md](01-conventions.md) consistently in the UI too.

## 9. Performance

- Budgets for public pages (marketing and portfolios), measured on a mid-range phone: LCP under 2.5s, CLS under 0.1, INP under 200ms.
- **Images:** always `next/image` with real `width` and `height` (or `fill` with a sized parent) and a `sizes` attribute. The image above the fold gets `priority`.
- **Fonts:** only through `next/font`, declared once in the root layout. No font `<link>` tags.
- **Client JavaScript is a cost.** Before adding a client-side dependency, check its size and whether the server or CSS can do the job. Heavy, rarely used client components load with `next/dynamic`.
- Animate `transform` and `opacity` only. No layout-triggering animation. No animation longer than about 800ms on entry, 200ms on interaction.
- Lists that can grow large are paginated or virtualised, never rendered in full.

## 10. Templates (`packages/templates`)

- A template is a React component taking `content` and `theme` and nothing else. It never fetches data and never reads the database.
- It declares which sections it supports. An unsupported or hidden section is skipped, never rendered broken.
- It renders every field as text. No `dangerouslySetInnerHTML` on user content, ever ([06-security-privacy.md](06-security-privacy.md)).
- It must render acceptably with thin content: no photo, one project, no experience, a very long name.
- Every template is responsive from 320px, passes the accessibility rules above, and meets the performance budgets, because the public page is the product.
- A new template is a new folder plus one registry entry. Nothing else changes.
