import { describe, expect, it } from 'vitest';

import { getSafeRedirectPath } from './safe-redirect';

const FALLBACK = '/app';

describe('getSafeRedirectPath', () => {
  it('keeps same-site paths, with query and hash', () => {
    expect(getSafeRedirectPath('/app/portfolios', FALLBACK)).toBe('/app/portfolios');
    expect(getSafeRedirectPath('/app?tab=2#top', FALLBACK)).toBe('/app?tab=2#top');
  });

  it.each([null, undefined, ''])('falls back when the path is %s', (path) => {
    expect(getSafeRedirectPath(path, FALLBACK)).toBe(FALLBACK);
  });

  it.each([
    'https://evil.example',
    '//evil.example',
    '/\\evil.example',
    'javascript:alert(1)',
    'app',
    '/app\nSet-Cookie: x=1',
  ])('falls back for %s', (path) => {
    expect(getSafeRedirectPath(path, FALLBACK)).toBe(FALLBACK);
  });
});
