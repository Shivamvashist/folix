import { sql } from 'drizzle-orm';

import type { Database } from './client';

/** Resolves when the database answers a trivial query, rejects otherwise. */
export async function pingDatabase(db: Database): Promise<void> {
  await db.execute(sql`select 1`);
}
