import { z } from 'zod';

import { SLUG_MAX_LENGTH, SLUG_MIN_LENGTH } from './limits';

/**
 * Slugs that can never be claimed, because the public page lives at `/<slug>` and shares
 * the root of the URL space with the app's own routes.
 *
 * Every top-level route segment in apps/web/src/app MUST be listed here before it ships.
 */
export const RESERVED_SLUGS: ReadonlySet<string> = new Set([
  // App routes, current and planned
  'app',
  'api',
  'login',
  'logout',
  'signup',
  'register',
  'auth',
  'account',
  'settings',
  'dashboard',
  'onboarding',
  'pricing',
  'billing',
  'checkout',
  'templates',
  'examples',
  'blog',
  'docs',
  'help',
  'support',
  'contact',
  'about',
  'careers',
  'press',
  'legal',
  'terms',
  'privacy',
  'security',
  'status',
  'report',
  'abuse',
  // Roles and ownership
  'admin',
  'administrator',
  'root',
  'system',
  'staff',
  'team',
  'official',
  'moderator',
  // Technical paths
  'www',
  'mail',
  'static',
  'assets',
  'public',
  'cdn',
  'img',
  'images',
  'fonts',
  '_next',
  'favicon',
  'robots',
  'sitemap',
  'manifest',
  'well-known',
  'null',
  'undefined',
  'new',
  'edit',
  'me',
  // Brand
  'folix',
  'folio',
]);

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export type SlugIssue = 'tooShort' | 'tooLong' | 'invalidCharacters' | 'reserved';

/** Lowercases and trims user input so `Jane-Doe ` and `jane-doe` are the same slug. */
export function normalizeSlug(input: string): string {
  return input.trim().toLowerCase();
}

export function isReservedSlug(slug: string): boolean {
  return RESERVED_SLUGS.has(slug);
}

/**
 * Returns the first rule a slug breaks, or null when it is well formed and not reserved.
 * Whether the slug is free is a database question and is not answered here.
 */
export function getSlugIssue(slug: string): SlugIssue | null {
  if (slug.length < SLUG_MIN_LENGTH) return 'tooShort';
  if (slug.length > SLUG_MAX_LENGTH) return 'tooLong';
  if (!SLUG_PATTERN.test(slug)) return 'invalidCharacters';
  if (isReservedSlug(slug)) return 'reserved';
  return null;
}

/** Parses raw input into a normalised slug. The issue code is the error message. */
export const slugSchema = z
  .string()
  .transform(normalizeSlug)
  .superRefine((slug, context) => {
    const issue = getSlugIssue(slug);
    if (issue) context.addIssue({ code: 'custom', message: issue });
  });

export type Slug = z.infer<typeof slugSchema>;
