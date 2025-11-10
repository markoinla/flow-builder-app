import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { createDb } from '../db';
import type { D1Database } from '@cloudflare/workers-types';

/**
 * Create Better Auth instance for Cloudflare Workers
 * This function is designed to work with Cloudflare D1 database
 */
export function createAuth(db: D1Database) {
  const drizzleDb = createDb(db);

  return betterAuth({
    database: drizzleAdapter(drizzleDb, {
      provider: 'sqlite',
      usePlural: true,
    }),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false, // Set to true in production with email service
    },
    session: {
      expiresIn: 60 * 60 * 24 * 7, // 7 days
      updateAge: 60 * 60 * 24, // 1 day (update session if older than this)
    },
    user: {
      additionalFields: {
        // Add any custom user fields here
      },
    },
  });
}

export type Auth = ReturnType<typeof createAuth>;
