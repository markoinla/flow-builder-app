import { createFileRoute } from '@tanstack/react-router';
import { env } from 'cloudflare:workers';
import { createAuth } from '../../../lib/auth';

/**
 * Better Auth API Route Handler
 * This route catches all /api/auth/* requests and forwards them to Better Auth
 *
 * Better Auth handles these endpoints automatically:
 * - POST /api/auth/sign-up/email
 * - POST /api/auth/sign-in/email
 * - POST /api/auth/sign-out
 * - GET /api/auth/session
 * - And more...
 */

async function handleAuthRequest(request: Request) {
  // Access D1 database from Cloudflare bindings
  const db = env.DB;

  if (!db) {
    return new Response(
      JSON.stringify({
        error: 'Database not configured',
        message: 'The D1 database binding is not available.',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  const auth = createAuth(db);

  // Forward the request to Better Auth
  return auth.handler(request);
}

export const Route = createFileRoute('/api/auth/$')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        return handleAuthRequest(request);
      },
      POST: async ({ request }) => {
        return handleAuthRequest(request);
      },
    },
  },
});
