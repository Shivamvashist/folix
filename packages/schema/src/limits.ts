/**
 * Product limits. One definition, used by the database layer, server actions and UI copy.
 * Changing a number here is a product decision: record it in docs/decisions/DECISIONS.md.
 */

/** Plan: "Maximum 2 portfolios per user". */
export const MAX_PORTFOLIOS_PER_USER = 2;

/** Plan: a released slug redirects, and stays unclaimable, for 30 days. */
export const SLUG_HOLD_DAYS = 30;

export const SLUG_MIN_LENGTH = 3;
export const SLUG_MAX_LENGTH = 30;
