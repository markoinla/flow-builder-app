import { createFileRoute } from '@tanstack/react-router';
import { json } from '@tanstack/react-start';
import { env } from 'cloudflare:workers';
import { createDb, flows, flowData } from '../../../db';
import { eq } from 'drizzle-orm';

/**
 * Flows API Endpoints
 *
 * GET /api/flows - List all flows for the current user
 * POST /api/flows - Create a new flow
 */

export const Route = createFileRoute('/api/flows/')({
  server: {
    handlers: {
      // GET - List all flows for the user
      GET: async ({ request }) => {
        try {
          const db = createDb(env.DB);

          // TODO: Get userId from session/auth
          const userId = 'temp-user-id';

          const userFlows = await db
            .select()
            .from(flows)
            .where(eq(flows.userId, userId));

          return json(userFlows);
        } catch (error) {
          console.error('Error fetching flows:', error);
          return json({ error: 'Failed to fetch flows' }, { status: 500 });
        }
      },

      // POST - Create a new flow
      POST: async ({ request }) => {
        try {
          const db = createDb(env.DB);
          const body = await request.json();

          // TODO: Get userId from session/auth
          const userId = 'temp-user-id';

          const flowId = crypto.randomUUID();
          const flowDataId = crypto.randomUUID();

          // Create flow metadata
          const newFlow = {
            id: flowId,
            userId,
            name: body.name || 'Untitled Flow',
            description: body.description || null,
          };

          await db.insert(flows).values(newFlow);

          // Create flow data
          const newFlowData = {
            id: flowDataId,
            flowId,
            nodes: body.nodes || [],
            edges: body.edges || [],
            viewport: body.viewport || { x: 0, y: 0, zoom: 1 },
          };

          await db.insert(flowData).values(newFlowData);

          return json(
            { flow: newFlow, flowData: newFlowData },
            { status: 201 }
          );
        } catch (error) {
          console.error('Error creating flow:', error);
          return json({ error: 'Failed to create flow' }, { status: 500 });
        }
      },
    },
  },
});
