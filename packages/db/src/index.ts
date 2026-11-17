// Public API of @folix/db. Storage only: business rules live in the caller.
export { createDb, type Database } from './client';
export { pingDatabase } from './health';
export * as schema from './schema';
