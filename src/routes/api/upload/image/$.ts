import { createFileRoute } from '@tanstack/react-router';
import { env } from 'cloudflare:workers';

/**
 * Image Serve API Endpoint
 *
 * GET /api/upload/image/* - Serve an image from R2
 * Supports nested paths like /api/upload/image/userId/filename.png
 */

export const Route = createFileRoute('/api/upload/image/$')({
  server: {
    handlers: {
      // GET - Serve image from R2
      GET: async ({ params }) => {
        try {
          // The _splat parameter captures the full remaining path
          const filename = params._splat;

          if (!filename) {
            return new Response('Filename is required', { status: 400 });
          }

          // Get the image from R2 bucket
          const object = await env.IMAGES.get(filename);

          if (!object) {
            return new Response('Image not found', { status: 404 });
          }

          // Return the image with proper headers
          const headers = new Headers();
          object.writeHttpMetadata(headers);
          headers.set('etag', object.httpEtag);
          headers.set('cache-control', 'public, max-age=31536000, immutable');

          return new Response(object.body, {
            headers,
          });
        } catch (error) {
          console.error('Image serve error:', error);
          return new Response('Failed to serve image', { status: 500 });
        }
      },
    },
  },
});
