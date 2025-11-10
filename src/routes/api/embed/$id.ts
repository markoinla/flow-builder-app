import { createFileRoute } from '@tanstack/react-router';
import { json } from '@tanstack/react-start';
import { env } from 'cloudflare:workers';
import { createDb, flows, flowData } from '../../../db';
import { eq } from 'drizzle-orm';

/**
 * Public Embed API Endpoint
 *
 * GET /api/embed/:id - Get a specific flow for embedding (no auth required)
 */

export const Route = createFileRoute('/api/embed/$id')({
  server: {
    handlers: {
      // GET - Get a specific flow with its data (public access for embedding)
      GET: async ({ params }) => {
        try {
          const db = createDb(env.DB);
          const { id } = params;

          // Get flow without user authentication
          const flow = await db
            .select()
            .from(flows)
            .where(eq(flows.id, id))
            .limit(1);

          if (!flow || flow.length === 0) {
            return json({ error: 'Flow not found' }, { status: 404 });
          }

          const data = await db
            .select()
            .from(flowData)
            .where(eq(flowData.flowId, id))
            .limit(1);

          return json({
            flow: flow[0],
            flowData: data[0] || null,
          });
        } catch (error) {
          console.error('Error fetching flow for embed:', error);
          return json({ error: 'Failed to fetch flow' }, { status: 500 });
        }
      },
    },
  },
});
