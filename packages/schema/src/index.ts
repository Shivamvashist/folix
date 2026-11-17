// Public API of @folix/schema. Other packages import from here, never from files inside.
export { MAX_PORTFOLIOS_PER_USER, SLUG_HOLD_DAYS, SLUG_MAX_LENGTH, SLUG_MIN_LENGTH } from './limits';
export {
  RESERVED_SLUGS,
  SLUG_PATTERN,
  getSlugIssue,
  isReservedSlug,
  normalizeSlug,
  slugSchema,
  type Slug,
  type SlugIssue,
} from './slug';
