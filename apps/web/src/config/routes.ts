/**
 * Every internal path, in one place. Link to `ROUTES.x`, never to a string literal.
 *
 * A new top-level segment here must also be added to RESERVED_SLUGS in @folix/schema,
 * because public portfolios live at `/<slug>` (routes.test.ts enforces this).
 */
export const ROUTES = {
  home: '/',
  login: '/login',
  dashboard: '/app',
  api: {
    auth: '/api/auth',
    health: '/api/health',
  },
} as const;

/** Where a signed-in user lands when no return path was requested. */
export const DEFAULT_SIGNED_IN_ROUTE = ROUTES.dashboard;
