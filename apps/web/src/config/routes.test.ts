import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';

import { isReservedSlug } from '@folix/schema';
import { describe, expect, it } from 'vitest';

const APP_DIR = resolve(import.meta.dirname, '../app');

/** Top-level URL segments the app serves: folders in src/app, minus route groups and dynamic segments. */
function getTopLevelSegments(): string[] {
  return readdirSync(APP_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((name) => !name.startsWith('(') && !name.startsWith('[') && !name.startsWith('_'));
}

function getGroupedSegments(): string[] {
  return readdirSync(APP_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name.startsWith('('))
    .flatMap((group) =>
      readdirSync(resolve(APP_DIR, group.name), { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name),
    )
    .filter((name) => !name.startsWith('(') && !name.startsWith('[') && !name.startsWith('_'));
}

describe('app routes and portfolio slugs', () => {
  it('reserves every top-level route segment so no portfolio can shadow it', () => {
    const segments = [...getTopLevelSegments(), ...getGroupedSegments()];
    expect(segments.length).toBeGreaterThan(0);
    for (const segment of segments) {
      expect(isReservedSlug(segment), `"${segment}" must be in RESERVED_SLUGS`).toBe(true);
    }
  });
});
