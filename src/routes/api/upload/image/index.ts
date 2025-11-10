import { createFileRoute } from '@tanstack/react-router';
import { json } from '@tanstack/react-start';
import { env } from 'cloudflare:workers';
import { createAuth } from '../../../../lib/auth';

/**
 * Image Upload API Endpoint
 *
 * POST /api/upload/image - Upload an image to R2
 */

export const Route = createFileRoute('/api/upload/image/')({
  server: {
    handlers: {
      // POST - Upload image to R2
      POST: async ({ request }) => {
        try {
          const auth = createAuth(env.DB);

          // Get user session
          const session = await auth.api.getSession({
            headers: request.headers
          });

          if (!session?.user?.id) {
            return json({ error: 'Unauthorized' }, { status: 401 });
          }

          // Parse the multipart form data
          const formData = await request.formData();
          const file = formData.get('image') as File;

          if (!file) {
            return json({ error: 'No image file provided' }, { status: 400 });
          }

          // Validate file type
          const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
          if (!allowedTypes.includes(file.type)) {
            return json(
              { error: 'Invalid file type. Allowed types: JPEG, PNG, GIF, WebP, SVG' },
              { status: 400 }
            );
          }

          // Validate file size (max 10MB)
          const maxSize = 10 * 1024 * 1024; // 10MB
          if (file.size > maxSize) {
            return json(
              { error: 'File too large. Maximum size is 10MB' },
              { status: 400 }
            );
          }

          // Generate unique filename
          const timestamp = Date.now();
          const randomString = Math.random().toString(36).substring(2, 15);
          const extension = file.name.split('.').pop();
          const filename = `${session.user.id}/${timestamp}-${randomString}.${extension}`;

          // Upload to R2
          const arrayBuffer = await file.arrayBuffer();
          await env.IMAGES.put(filename, arrayBuffer, {
            httpMetadata: {
              contentType: file.type,
            },
          });

          // Generate public URL
          // In production, you'd use a custom domain or R2 public bucket
          const imageUrl = `/api/upload/image/${filename}`;

          return json({
            success: true,
            imageUrl,
            filename,
          });
        } catch (error) {
          console.error('Image upload error:', error);
          return json(
            { error: 'Failed to upload image' },
            { status: 500 }
          );
        }
      },
    },
  },
});
