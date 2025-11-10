import { createFileRoute } from '@tanstack/react-router';
import { json } from '@tanstack/react-start';
import { env } from 'cloudflare:workers';
import { createDb, flows, flowData } from '../../../db';
import { eq, and } from 'drizzle-orm';

/**
 * Flow Individual API Endpoints
 *
 * GET /api/flows/:id - Get a specific flow with its data
 * PUT /api/flows/:id - Update a flow
 * DELETE /api/flows/:id - Delete a flow
 */

export const Route = createFileRoute('/api/flows/$id')({
  server: {
    handlers: {
      // GET - Get a specific flow with its data
      GET: async ({ params }) => {
        try {
          const db = createDb(env.DB);
          const { id } = params;

          // TODO: Get userId from session/auth
          const userId = 'temp-user-id';

          const flow = await db
            .select()
            .from(flows)
            .where(and(eq(flows.id, id), eq(flows.userId, userId)))
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
          console.error('Error fetching flow:', error);
          return json({ error: 'Failed to fetch flow' }, { status: 500 });
        }
      },

      // PUT - Update a flow and its data
      PUT: async ({ request, params }) => {
        try {
          const db = createDb(env.DB);
          const body = await request.json();
          const { id } = params;

          // TODO: Get userId from session/auth
          const userId = 'temp-user-id';

          // Update flow metadata
          if (body.name || body.description) {
            await db
              .update(flows)
              .set({
                name: body.name,
                description: body.description,
                updatedAt: new Date(),
              })
              .where(and(eq(flows.id, id), eq(flows.userId, userId)));
          }

          // Update flow data (nodes, edges, viewport)
          if (body.nodes || body.edges || body.viewport) {
            await db
              .update(flowData)
              .set({
                nodes: body.nodes,
                edges: body.edges,
                viewport: body.viewport,
                updatedAt: new Date(),
              })
              .where(eq(flowData.flowId, id));
          }

          return json({ success: true });
        } catch (error) {
          console.error('Error updating flow:', error);
          return json({ error: 'Failed to update flow' }, { status: 500 });
        }
      },

      // DELETE - Delete a flow
      DELETE: async ({ params }) => {
        try {
          const db = createDb(env.DB);
          const { id } = params;

          // TODO: Get userId from session/auth
          const userId = 'temp-user-id';

          // Delete flow (flowData will cascade delete due to foreign key)
          await db
            .delete(flows)
            .where(and(eq(flows.id, id), eq(flows.userId, userId)));

          return json({ success: true });
        } catch (error) {
          console.error('Error deleting flow:', error);
          return json({ error: 'Failed to delete flow' }, { status: 500 });
        }
      },
    },
  },
});
