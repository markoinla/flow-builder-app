import { createFileRoute } from '@tanstack/react-router';
import { json } from '@tanstack/react-start';
import { env } from 'cloudflare:workers';
import { createDb, nodeTypes } from '../../../db';
import { eq } from 'drizzle-orm';

/**
 * Node Types API Endpoints
 *
 * GET /api/node-types - List all node types for the current user
 * POST /api/node-types - Create a new node type
 */

export const Route = createFileRoute('/api/node-types/')({
  server: {
    handlers: {
      // GET - List all node types for the user
      GET: async ({ request }) => {
        try {
          const db = createDb(env.DB);

          // TODO: Get userId from session/auth
          // For now, using a placeholder - you'll need to integrate with your auth
          const userId = 'temp-user-id';

          const userNodeTypes = await db
            .select()
            .from(nodeTypes)
            .where(eq(nodeTypes.userId, userId));

          return json(userNodeTypes);
        } catch (error) {
          console.error('Error fetching node types:', error);
          return json(
            { error: 'Failed to fetch node types' },
            { status: 500 }
          );
        }
      },

      // POST - Create a new node type
      POST: async ({ request }) => {
        try {
          const db = createDb(env.DB);
          const body = await request.json() as any;

          // TODO: Get userId from session/auth
          const userId = 'temp-user-id';

          // Ensure handles has a default value if not provided
          const handles = body.handles || { top: 'both', bottom: 'both' };

          const newNodeType = {
            id: body.id,
            userId,
            name: body.name,
            type: body.type,
            style: body.style || null,
            iconStyle: body.iconStyle || null,
            imageStyle: body.imageStyle || null,
            handles,
          };

          await db.insert(nodeTypes).values(newNodeType);

          return json(newNodeType, { status: 201 });
        } catch (error: any) {
          console.error('Error creating node type:', error);
          return json(
            { error: 'Failed to create node type', details: error?.message || 'Unknown error' },
            { status: 500 }
          );
        }
      },
    },
  },
});
