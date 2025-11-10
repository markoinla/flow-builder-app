import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';

export * from './schema';

/**
 * Create a Drizzle database instance for Cloudflare D1
 * @param db - The D1 database binding from Cloudflare Workers
 * @returns Drizzle database instance with schema
 */
export function createDb(db: D1Database) {
  return drizzle(db, { schema });
}

export type DrizzleDb = ReturnType<typeof createDb>;
