import { createFileRoute } from '@tanstack/react-router';
import { json } from '@tanstack/react-start';
import { env } from 'cloudflare:workers';
import { createDb, nodeTypes } from '../../../db';
import { eq, and } from 'drizzle-orm';

/**
 * Node Type Individual API Endpoints
 *
 * PUT /api/node-types/:id - Update a node type
 * DELETE /api/node-types/:id - Delete a node type
 */

export const Route = createFileRoute('/api/node-types/$id')({
  server: {
    handlers: {
      // PUT - Update a node type
      PUT: async ({ request, params }) => {
        try {
          const db = createDb(env.DB);
          const body = await request.json() as any;
          const { id } = params;

          // TODO: Get userId from session/auth
          const userId = 'temp-user-id';

          // Ensure handles has a default value if not provided
          const handles = body.handles || { top: 'both', bottom: 'both' };

          const updatedNodeType = {
            name: body.name,
            type: body.type,
            style: body.style || null,
            iconStyle: body.iconStyle || null,
            imageStyle: body.imageStyle || null,
            handles,
            updatedAt: new Date(),
          };

          await db
            .update(nodeTypes)
            .set(updatedNodeType)
            .where(and(eq(nodeTypes.id, id), eq(nodeTypes.userId, userId)));

          return json({ ...updatedNodeType, id });
        } catch (error: any) {
          console.error('Error updating node type:', error);
          return json(
            { error: 'Failed to update node type', details: error?.message || 'Unknown error' },
            { status: 500 }
          );
        }
      },

      // DELETE - Delete a node type
      DELETE: async ({ params }) => {
        try {
          const db = createDb(env.DB);
          const { id } = params;

          // TODO: Get userId from session/auth
          const userId = 'temp-user-id';

          await db
            .delete(nodeTypes)
            .where(and(eq(nodeTypes.id, id), eq(nodeTypes.userId, userId)));

          return json({ success: true });
        } catch (error) {
          console.error('Error deleting node type:', error);
          return json(
            { error: 'Failed to delete node type' },
            { status: 500 }
          );
        }
      },
    },
  },
});
