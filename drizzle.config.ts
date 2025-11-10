import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  driver: 'd1-http',
  dbCredentials: {
    // For local development, Wrangler will use a local SQLite file
    // For production, you'll need to set these environment variables
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID || '',
    databaseId: process.env.CLOUDFLARE_DATABASE_ID || 'local-db',
    token: process.env.CLOUDFLARE_API_TOKEN || '',
  },
});
