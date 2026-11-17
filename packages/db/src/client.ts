import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import * as schema from './schema';

/**
 * Creates the database client. The package never reads environment variables:
 * the app validates its env and passes the connection string in.
 *
 * The pool connects lazily, so creating a client does not need a reachable database.
 */
export function createDb(connectionString: string) {
  const pool = new Pool({ connectionString, max: 10 });
  return drizzle({ client: pool, schema, casing: 'snake_case' });
}

export type Database = ReturnType<typeof createDb>;
