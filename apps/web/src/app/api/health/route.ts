import { pingDatabase } from '@folix/db';
import { connection } from 'next/server';

import { db } from '@/server/db';

const NO_STORE = { 'Cache-Control': 'no-store' };

/** Liveness and database check for uptime monitoring. Reveals nothing beyond up or down. */
export async function GET(): Promise<Response> {
  await connection();
  try {
    await pingDatabase(db);
    return Response.json({ status: 'ok' }, { headers: NO_STORE });
  } catch (error) {
    console.error('[health] database check failed', error);
    return Response.json({ status: 'unavailable' }, { status: 503, headers: NO_STORE });
  }
}
