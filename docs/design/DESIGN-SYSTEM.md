# Folix design system

How the product looks and why. The values live in one file, [`apps/web/src/app/globals.css`](../../apps/web/src/app/globals.css). This document explains how to use them. Frontend rules: [../rules/03-frontend.md](../rules/03-frontend.md).

## 1. Direction

Folix sells good writing, so the interface looks like a well-set page: warm paper, ink text, generous space, confident headings, and one colour used on purpose. It should feel edited, not decorated.

- **Calm surface, strong type.** Hierarchy comes from size, weight and space before colour.
- **One brand colour.** Ultramarine marks the single most important thing on a screen. If everything is blue, nothing is.
- **Mono for labels.** Small uppercase mono text marks metadata: eyebrows, step numbers, counts. It gives the page a quiet technical voice that suits the developer audience.
- **Real content in illustrations.** Product visuals are built from markup with example content, labelled as an example.

## 2. Colour roles

Components use roles, never raw values. Each role has a light and a dark value, so a component written with roles works in both schemes.

| Role (Tailwind class stem)                         | Use for                                                               |
| -------------------------------------------------- | --------------------------------------------------------------------- |
| `background` / `foreground`                        | The page and its main text                                            |
| `card` / `card-foreground`                         | Raised surfaces: cards, panels, the preview frame                     |
| `popover` / `popover-foreground`                   | Floating surfaces: menus, dialogs                                     |
| `muted` / `muted-foreground`                       | Quiet backgrounds, and secondary text                                 |
| `accent` / `accent-foreground`                     | Hover and selected backgrounds on neutral controls                    |
| `primary` / `primary-foreground`                   | The default solid button: ink in light, paper in dark                 |
| `secondary` / `secondary-foreground`               | Lower-emphasis solid controls                                         |
| `brand` / `brand-foreground`                       | The key action and key emphasis. Use sparingly.                       |
| `brand-soft`                                       | Tinted background behind a brand-coloured icon                        |
| `success`                                          | Confirmation                                                          |
| `destructive`                                      | Errors and destructive actions                                        |
| `border`, `input`, `ring`                          | Lines, field borders, focus rings                                     |
| `inverse` / `inverse-foreground` / `inverse-muted` | The dark band (principles, footer, login aside), dark in both schemes |

Rules:

- No hex values, no arbitrary colour classes (`bg-[#...]`), no Tailwind palette colours (`bg-blue-600`). Lint blocks the first two.
- `brand` on a screen: one primary action, plus small accents (an icon, a step number). Never large brand-coloured text blocks except the hero accent and the final call to action.
- Text on `background` or `card` is `foreground` or `muted-foreground`. Nothing lighter: it fails contrast.
- Adding a role: add the variable for both schemes, map it in `@theme inline`, check contrast (4.5:1 for text), and add a row here.

## 3. Type

| Family              | Token          | Use for                               |
| ------------------- | -------------- | ------------------------------------- |
| Bricolage Grotesque | `font-display` | Headings, the wordmark, large numbers |
| Geist               | `font-sans`    | Everything else                       |
| Geist Mono          | `font-mono`    | Labels, eyebrows, metadata, code      |

| Size token                                    | Use for                                  | Notes                                            |
| --------------------------------------------- | ---------------------------------------- | ------------------------------------------------ |
| `text-display`                                | The one hero heading on a marketing page | Fluid, tight leading and tracking                |
| `text-title`                                  | Section headings (`h2`)                  | Fluid                                            |
| `text-lead`                                   | The paragraph under a heading            | Fluid                                            |
| `text-4xl`, `text-3xl`, `text-2xl`, `text-xl` | Page and card headings in the app        | With `font-display font-semibold tracking-tight` |
| `text-base`                                   | Body                                     | `leading-relaxed` for paragraphs                 |
| `text-sm`                                     | Secondary text, controls                 |                                                  |
| `text-xs`                                     | Mono labels only                         | Never for body text                              |

- Headings are sentence case, `font-semibold`, and balanced (`text-wrap: balance` is global).
- The `.eyebrow` class is the standard label above a heading.
- Line length for reading text: 45 to 75 characters. Use `max-w-md` to `max-w-2xl`.
- Numbers that change or align use `tabular-nums`.

## 4. Space and layout

- **`Container`** sets the page width (`max-w-6xl`) and gutters (`px-5`, `sm:px-8`). Every full-width section uses it.
- **Section rhythm:** `py-20 sm:py-28` between marketing sections. App pages use `py-10 sm:py-14`.
- **Scale:** use Tailwind's spacing steps. Common gaps: 4 (16px) between cards, 6 to 8 inside cards, 12 between a heading and its content.
- **Grid:** content sits on a 12-column feel without a literal grid class. Prefer two clear columns to many small ones.
- **Mobile first.** Everything stacks at 320px. Side-by-side layouts start at `md` or `lg`.
- **Radius:** `rounded-2xl` for cards and panels, `rounded-xl` for inner blocks and icon tiles, `rounded-full` for buttons and pills, `rounded-md` for small controls. All derive from `--radius`.
- **Elevation:** borders first. `shadow-soft` on hover or for a raised button, `shadow-lift` for the one floating object on a screen. Never stack shadows.

## 5. Components

| Component            | Where                                   | Use for                                               |
| -------------------- | --------------------------------------- | ----------------------------------------------------- |
| `Button`             | `components/ui/button.tsx`              | Actions: submit, toggle, open                         |
| `LinkButton`         | `components/shared/link-button.tsx`     | Navigation that looks like a button                   |
| `Input`, `Label`     | `components/ui/`                        | Form fields. Always paired.                           |
| `Badge`, `Separator` | `components/ui/`                        | Status pills, dividers                                |
| `Container`          | `components/layout/container.tsx`       | Page width and gutters                                |
| `SectionHeading`     | `components/layout/section-heading.tsx` | Eyebrow, title and lead that open a marketing section |
| `Logo`, `LogoMark`   | `components/brand/logo.tsx`             | The mark and wordmark                                 |

- Interactive controls are at least 44px tall on touch screens (`h-11`).
- Focus is always visible: `focus-visible:ring-3 focus-visible:ring-ring/50`.
- Icons come from `lucide-react`, 16 to 24px, stroke width 1.75 to 2. Decorative icons carry `aria-hidden`.
- Add a shadcn primitive with `pnpm dlx shadcn@latest add <name>` from `apps/web`, then restyle with tokens if needed.

## 6. Motion

- **Purpose only:** motion shows where something came from or that something happened. No decoration that loops.
- **Entrance:** `animate-rise` (fade and 14px rise, 0.8s, ease-out-expo), staggered by 80ms with `[animation-delay:...]`, used on the hero only.
- **Interaction:** 200ms colour and shadow transitions. Buttons move 1px down on press.
- Animate `transform` and `opacity` only.
- `prefers-reduced-motion` switches all of it off globally. Nothing may depend on an animation finishing to become visible or usable.

## 7. Dark mode

Follows the system setting through `prefers-color-scheme`. No toggle and no script, so there is no flash on load. Components written with roles need no `dark:` classes. Check both schemes for every new screen.

## 8. Voice

Plain words, short sentences, sentence case. Buttons say what happens. No exclamation marks, no jargon, no em-dashes. Marketing copy claims only what the product does.

## 9. Portfolio templates

Templates have their own visual identity and do **not** use the app's brand colours. They take a `theme` (an accent and a font pair chosen from fixed sets) and apply it as CSS variables on their root element. The rules for templates are in [../rules/03-frontend.md](../rules/03-frontend.md), section 10. Their token sets will be documented here when Milestone 2 builds the first one.
