import 'server-only';

import { createDb, type Database } from '@folix/db';

import { env } from '@/env';

// Next.js reloads modules in development. Keeping the client on globalThis stops every
// reload from opening a new connection pool.
const globalForDb = globalThis as typeof globalThis & { folixDb?: Database };

export const db: Database = globalForDb.folixDb ?? createDb(env.DATABASE_URL);

if (env.NODE_ENV !== 'production') globalForDb.folixDb = db;
