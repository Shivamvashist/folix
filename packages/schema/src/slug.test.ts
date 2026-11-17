import { describe, expect, it } from 'vitest';

import { SLUG_MAX_LENGTH, SLUG_MIN_LENGTH } from './limits';
import { getSlugIssue, isReservedSlug, normalizeSlug, slugSchema } from './slug';

describe('normalizeSlug', () => {
  it('lowercases and trims', () => {
    expect(normalizeSlug('  Jane-Doe ')).toBe('jane-doe');
  });
});

describe('getSlugIssue', () => {
  it('accepts letters, digits and single hyphens', () => {
    expect(getSlugIssue('jane-doe')).toBeNull();
    expect(getSlugIssue('jane2')).toBeNull();
    expect(getSlugIssue('a-b-c')).toBeNull();
  });

  it('checks the length limits at the boundary', () => {
    expect(getSlugIssue('a'.repeat(SLUG_MIN_LENGTH - 1))).toBe('tooShort');
    expect(getSlugIssue('a'.repeat(SLUG_MIN_LENGTH))).toBeNull();
    expect(getSlugIssue('a'.repeat(SLUG_MAX_LENGTH))).toBeNull();
    expect(getSlugIssue('a'.repeat(SLUG_MAX_LENGTH + 1))).toBe('tooLong');
  });

  it.each(['-jane', 'jane-', 'jane--doe', 'jane_doe', 'jane.doe', 'jane doe', 'Jane', 'jané', 'jane/doe'])(
    'rejects %s',
    (slug) => {
      expect(getSlugIssue(slug)).toBe('invalidCharacters');
    },
  );

  it('rejects reserved slugs', () => {
    expect(getSlugIssue('admin')).toBe('reserved');
    expect(getSlugIssue('api')).toBe('reserved');
    expect(getSlugIssue('folix')).toBe('reserved');
  });
});

describe('isReservedSlug', () => {
  it('covers the app routes named in the plan', () => {
    for (const slug of ['app', 'api', 'login', 'admin', 'pricing']) {
      expect(isReservedSlug(slug)).toBe(true);
    }
  });
});

describe('slugSchema', () => {
  it('returns the normalised slug', () => {
    expect(slugSchema.parse(' Jane-Doe ')).toBe('jane-doe');
  });

  it('reports the issue code as the message', () => {
    const result = slugSchema.safeParse('Admin');
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe('reserved');
  });
});
