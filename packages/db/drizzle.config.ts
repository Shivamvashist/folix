import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

import { defineConfig } from 'drizzle-kit';

// The app owns the env file. drizzle-kit runs from this package, so load it from there.
// drizzle-kit compiles this file to CommonJS, so import.meta is not available: the db
// scripts always run with packages/db as the working directory.
const envFile = resolve(process.cwd(), '../../apps/web/.env.local');
if (existsSync(envFile)) process.loadEnvFile(envFile);

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/schema/index.ts',
  out: './migrations',
  casing: 'snake_case',
  strict: true,
  verbose: true,
  dbCredentials: {
    // `generate` works without a database. `migrate` and `studio` need the real URL.
    url: process.env.DATABASE_URL ?? '',
  },
});
