# Flow Builder - Embeddable Implementation Code Examples

This document contains specific TypeScript/React code examples for implementing the embeddable viewer feature.

## 1. FlowViewer Component (Extract from FlowBuilder)

**File: `src/components/FlowViewer.tsx`**

```typescript
import { memo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  type Node,
  type Edge,
  type NodeTypes,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { CustomNode } from './CustomNode';
import { IconNode } from './IconNode';

export interface ViewerConfig {
  /**
   * Show/hide the minimap in the bottom-right corner
   * @default true
   */
  showMiniMap?: boolean;

  /**
   * Show/hide zoom controls
   * @default true
   */
  showControls?: boolean;

  /**
   * Allow user interaction (pan, zoom)
   * @default true
   */
  interactive?: boolean;

  /**
   * Initial viewport state
   * @default {x: 0, y: 0, zoom: 1}
   */
  viewport?: {
    x: number;
    y: number;
    zoom: number;
  };

  /**
   * Optional CSS class name for styling
   */
  className?: string;
}

export interface FlowViewerProps {
  /**
   * Flow data to display (nodes and edges)
   */
  flowData: {
    nodes: Node[];
    edges: Edge[];
    viewport?: {
      x: number;
      y: number;
      zoom: number;
    };
  };

  /**
   * Viewer configuration options
   */
  config?: ViewerConfig;
}

const nodeTypes: NodeTypes = {
  custom: CustomNode,
  icon: IconNode,
};

/**
 * Read-only flow viewer component
 * Displays a flow diagram without editing capabilities
 */
export const FlowViewer = memo(function FlowViewer({
  flowData,
  config = {},
}: FlowViewerProps) {
  const {
    showMiniMap = true,
    showControls = true,
    interactive = true,
    viewport = flowData.viewport || { x: 0, y: 0, zoom: 1 },
    className = '',
  } = config;

  return (
    <div
      className={`w-full h-full bg-background ${className}`}
      style={{ backgroundColor: '#fafafa' }}
    >
      <ReactFlow
        nodes={flowData.nodes}
        edges={flowData.edges}
        nodeTypes={nodeTypes}
        fitView
        panOnDrag={interactive}
        panOnScroll={interactive}
        zoomOnScroll={interactive}
        zoomOnPinch={interactive}
        selectNodesOnDrag={false}
        defaultViewport={viewport}
      >
        <Background />
        {showControls && <Controls />}
        {showMiniMap && <MiniMap />}
      </ReactFlow>
    </div>
  );
});

FlowViewer.displayName = 'FlowViewer';
```

---

## 2. Public Viewer Route

**File: `src/routes/viewer/$token.tsx`**

```typescript
import { createFileRoute } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { json } from '@tanstack/react-start';
import { env } from 'cloudflare:workers';
import { createDb, flows, flowData, nodeTypes } from '../../db';
import { eq, and } from 'drizzle-orm';
import { FlowViewer } from '../../components/FlowViewer';
import { validatePublicToken, sanitizeFlowData } from '../../lib/embed-tokens';

// Server function to fetch flow data by token
const fetchPublicFlow = createServerFn('GET', async (token: string) => {
  try {
    const db = createDb(env.DB);

    // Validate token (could be JWT or DB lookup)
    const flowId = await validatePublicToken(token, db);
    if (!flowId) {
      return { error: 'Invalid or expired token', status: 401 };
    }

    // Fetch flow
    const flowRecord = await db
      .select()
      .from(flows)
      .where(eq(flows.id, flowId))
      .limit(1);

    if (!flowRecord || flowRecord.length === 0) {
      return { error: 'Flow not found', status: 404 };
    }

    // Fetch flow data
    const flowDataRecord = await db
      .select()
      .from(flowData)
      .where(eq(flowData.flowId, flowId))
      .limit(1);

    // Fetch node types used in this flow
    const userNodeTypes = await db
      .select()
      .from(nodeTypes)
      .where(eq(nodeTypes.userId, flowRecord[0].userId));

    // Sanitize data (remove sensitive fields)
    const sanitized = sanitizeFlowData({
      flow: flowRecord[0],
      flowData: flowDataRecord[0],
      nodeTypes: userNodeTypes,
    });

    return { success: true, data: sanitized };
  } catch (error) {
    console.error('Error fetching public flow:', error);
    return { error: 'Failed to fetch flow', status: 500 };
  }
});

export const Route = createFileRoute('/viewer/$token')({
  loader: async ({ params }) => {
    return await fetchPublicFlow(params.token);
  },
  component: ViewerPage,
  errorComponent: ({ error }) => (
    <div className="w-screen h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">Error</h1>
        <p className="text-muted-foreground">
          {error instanceof Error ? error.message : 'Failed to load flow'}
        </p>
      </div>
    </div>
  ),
});

function ViewerPage() {
  const result = Route.useLoaderData();

  if ('error' in result) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Error</h1>
          <p className="text-muted-foreground">{result.error}</p>
        </div>
      </div>
    );
  }

  const { flow, nodes, edges, viewport } = result.data;

  return (
    <div className="w-screen h-screen flex flex-col">
      {/* Optional header */}
      <div className="bg-card border-b px-6 py-4">
        <h1 className="text-2xl font-bold">{flow.name}</h1>
        {flow.description && (
          <p className="text-muted-foreground mt-1">{flow.description}</p>
        )}
      </div>

      {/* Viewer */}
      <div className="flex-1">
        <FlowViewer
          flowData={{
            nodes,
            edges,
            viewport,
          }}
          config={{
            showMiniMap: true,
            showControls: true,
            interactive: true,
          }}
        />
      </div>
    </div>
  );
}
```

---

## 3. Token Generation & Validation

**File: `src/lib/embed-tokens.ts`**

```typescript
import { jwtVerify, SignJWT } from 'jose';
import { createDb, flows, publicFlows } from '../db';
import { eq } from 'drizzle-orm';

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-key-change-in-production'
);

/**
 * Generate a public access token for a flow
 * Returns a signed JWT that can be used in embed URLs
 */
export async function generatePublicToken(
  flowId: string,
  expiresIn: number = 7 * 24 * 60 * 60 * 1000 // 7 days default
): Promise<string> {
  const now = Date.now();
  const expiresAt = new Date(now + expiresIn);

  const token = await new SignJWT({
    flowId,
    iat: Math.floor(now / 1000),
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(Math.floor(expiresAt.getTime() / 1000))
    .sign(secret);

  return token;
}

/**
 * Validate a public access token
 * Returns the flowId if valid, null if invalid/expired
 */
export async function validatePublicToken(
  token: string,
  db?: ReturnType<typeof createDb>
): Promise<string | null> {
  try {
    const verified = await jwtVerify(token, secret);
    const flowId = verified.payload.flowId as string;

    if (!flowId) {
      return null;
    }

    // Optional: Check in database if token has been revoked
    if (db) {
      const publicFlowRecord = await db
        .select()
        .from(publicFlows)
        .where(eq(publicFlows.token, token))
        .limit(1);

      if (!publicFlowRecord || publicFlowRecord.length === 0) {
        return null; // Token not found (revoked)
      }

      if (publicFlowRecord[0].expiresAt && publicFlowRecord[0].expiresAt < new Date()) {
        return null; // Token expired
      }
    }

    return flowId;
  } catch (error) {
    console.error('Token validation error:', error);
    return null;
  }
}

/**
 * Sanitize flow data for public consumption
 * Removes sensitive fields like userId, author info, etc.
 */
export function sanitizeFlowData(data: {
  flow: any;
  flowData: any;
  nodeTypes: any[];
}): {
  flow: {
    id: string;
    name: string;
    description?: string;
  };
  nodes: any[];
  edges: any[];
  viewport?: any;
} {
  // Remove sensitive fields from flow data
  const { id, name, description } = data.flow;

  // Sanitize node text to prevent XSS
  const sanitizedNodes = (data.flowData?.nodes || []).map((node: any) => ({
    ...node,
    data: {
      ...node.data,
      label: sanitizeText(node.data?.label || ''),
    },
  }));

  return {
    flow: {
      id,
      name,
      description: description || undefined,
    },
    nodes: sanitizedNodes,
    edges: data.flowData?.edges || [],
    viewport: data.flowData?.viewport,
  };
}

/**
 * Basic XSS prevention - HTML encode dangerous characters
 */
function sanitizeText(text: string): string {
  if (typeof text !== 'string') return '';
  
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Validate icon name (prevent injection)
 */
export function validateIconName(iconName: string): boolean {
  // Only allow alphanumeric, hyphens, and underscores
  return /^[a-zA-Z0-9\-_]+$/.test(iconName);
}
```

---

## 4. Public API Endpoint

**File: `src/routes/api/flows/public/$token.ts`**

```typescript
import { createFileRoute } from '@tanstack/react-router';
import { json } from '@tanstack/react-start';
import { env } from 'cloudflare:workers';
import { createDb, flows, flowData } from '../../../../db';
import { eq } from 'drizzle-orm';
import { validatePublicToken, sanitizeFlowData } from '../../../../lib/embed-tokens';
import { rateLimit } from '../../../../lib/rate-limit';

/**
 * GET /api/flows/public/:token
 * 
 * Returns public flow data for embedding
 * Requires valid token parameter
 * Rate limited by IP address
 */

export const Route = createFileRoute('/api/flows/public/$token')({
  server: {
    handlers: {
      GET: async ({ params, request }) => {
        try {
          const { token } = params;
          const clientIp =
            request.headers.get('cf-connecting-ip') ||
            request.headers.get('x-forwarded-for') ||
            'unknown';

          // Check rate limit
          const rateLimitResult = await rateLimit(clientIp, {
            maxRequests: 100,
            windowMs: 60 * 1000, // 1 minute
          });

          if (!rateLimitResult.allowed) {
            return json(
              { error: 'Rate limit exceeded' },
              {
                status: 429,
                headers: {
                  'Retry-After': String(rateLimitResult.retryAfter),
                },
              }
            );
          }

          const db = createDb(env.DB);

          // Validate token
          const flowId = await validatePublicToken(token, db);
          if (!flowId) {
            return json(
              { error: 'Invalid or expired token' },
              { status: 401 }
            );
          }

          // Fetch flow
          const flowRecord = await db
            .select()
            .from(flows)
            .where(eq(flows.id, flowId))
            .limit(1);

          if (!flowRecord || flowRecord.length === 0) {
            return json({ error: 'Flow not found' }, { status: 404 });
          }

          // Fetch flow data
          const flowDataRecord = await db
            .select()
            .from(flowData)
            .where(eq(flowData.flowId, flowId))
            .limit(1);

          const sanitized = sanitizeFlowData({
            flow: flowRecord[0],
            flowData: flowDataRecord[0],
            nodeTypes: [],
          });

          // Set CORS headers for embedding
          return json(sanitized, {
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, OPTIONS',
              'Access-Control-Max-Age': '3600',
              'Cache-Control': 'public, max-age=300', // 5 min cache
            },
          });
        } catch (error) {
          console.error('Error fetching public flow:', error);
          return json({ error: 'Failed to fetch flow' }, { status: 500 });
        }
      },

      // Handle CORS preflight
      OPTIONS: async () => {
        return new Response(null, {
          status: 204,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Max-Age': '3600',
          },
        });
      },
    },
  },
});
```

---

## 5. Database Schema Update

**File: `src/db/schema.ts` - Add this table**

```typescript
// Public flow tokens for sharing/embedding
export const publicFlows = sqliteTable('public_flows', {
  id: text('id').primaryKey(),
  flowId: text('flow_id')
    .notNull()
    .references(() => flows.id, { onDelete: 'cascade' }),
  // Token can be JWT or random string
  token: text('token').notNull().unique(),
  // Optional expiration
  expiresAt: integer('expires_at', { mode: 'timestamp' }),
  // Which domains can embed this (optional)
  allowedDomains: text('allowed_domains'), // JSON array
  // Track usage
  viewCount: integer('view_count').notNull().default(0),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
});

export type PublicFlow = typeof publicFlows.$inferSelect;
export type NewPublicFlow = typeof publicFlows.$inferInsert;
```

---

## 6. Embed Generator Component

**File: `src/components/FlowEmbedGenerator.tsx`**

```typescript
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Share2, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { generatePublicToken } from '../lib/embed-tokens';

interface FlowEmbedGeneratorProps {
  flowId: string;
  flowName: string;
}

export function FlowEmbedGenerator({ flowId, flowName }: FlowEmbedGeneratorProps) {
  const [open, setOpen] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [expiration, setExpiration] = useState('7days');
  const [copied, setCopied] = useState<'iframe' | 'api' | null>(null);
  const [loading, setLoading] = useState(false);

  const expirationMs = {
    '1day': 24 * 60 * 60 * 1000,
    '7days': 7 * 24 * 60 * 60 * 1000,
    '30days': 30 * 24 * 60 * 60 * 1000,
    'never': Infinity,
  }[expiration] || 7 * 24 * 60 * 60 * 1000;

  const handleGenerateToken = async () => {
    try {
      setLoading(true);
      const newToken = await generatePublicToken(
        flowId,
        expirationMs === Infinity ? 365 * 24 * 60 * 60 * 1000 : expirationMs
      );
      setToken(newToken);
      toast.success('Token generated successfully');
    } catch (error) {
      toast.error('Failed to generate token');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const iframeCode = token
    ? `<iframe src="https://flows.app/viewer/${token}" width="100%" height="600" sandbox="allow-same-origin" title="${flowName}"></iframe>`
    : '';

  const apiCode = token
    ? `fetch('https://flows.app/api/flows/public/${token}')
  .then(res => res.json())
  .then(data => console.log(data))`
    : '';

  const copyToClipboard = (text: string, type: 'iframe' | 'api') => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Share2 className="h-4 w-4 mr-2" />
          Generate Embed
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Generate Embed Link</DialogTitle>
          <DialogDescription>
            Create a shareable link to embed this flow in other websites
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Expiration selector */}
          <div className="space-y-2">
            <Label htmlFor="expiration">Link Expiration</Label>
            <Select value={expiration} onValueChange={setExpiration}>
              <SelectTrigger id="expiration">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1day">1 Day</SelectItem>
                <SelectItem value="7days">7 Days</SelectItem>
                <SelectItem value="30days">30 Days</SelectItem>
                <SelectItem value="never">Never Expires</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Generate button */}
          {!token && (
            <Button onClick={handleGenerateToken} disabled={loading} className="w-full">
              {loading ? 'Generating...' : 'Generate Token'}
            </Button>
          )}

          {/* Iframe embed code */}
          {token && (
            <div className="space-y-2">
              <Label htmlFor="iframe-code">Iframe Embed Code</Label>
              <div className="relative">
                <textarea
                  id="iframe-code"
                  readOnly
                  value={iframeCode}
                  className="w-full h-24 p-3 bg-muted text-sm font-mono rounded border"
                />
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-2 right-2"
                  onClick={() => copyToClipboard(iframeCode, 'iframe')}
                >
                  {copied === 'iframe' ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* API code example */}
          {token && (
            <div className="space-y-2">
              <Label htmlFor="api-code">API Usage Example</Label>
              <div className="relative">
                <textarea
                  id="api-code"
                  readOnly
                  value={apiCode}
                  className="w-full h-24 p-3 bg-muted text-sm font-mono rounded border"
                />
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-2 right-2"
                  onClick={() => copyToClipboard(apiCode, 'api')}
                >
                  {copied === 'api' ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Token display */}
          {token && (
            <div className="space-y-2">
              <Label>Token</Label>
              <div className="p-3 bg-muted rounded text-xs font-mono break-all">
                {token}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

---

## 7. Rate Limiting Utility

**File: `src/lib/rate-limit.ts`**

```typescript
// Simple in-memory rate limiter
// For production, use Redis or Cloudflare KV
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

export interface RateLimitOptions {
  maxRequests: number;
  windowMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfter: number;
}

export async function rateLimit(
  identifier: string,
  options: RateLimitOptions
): Promise<RateLimitResult> {
  const now = Date.now();
  const existing = rateLimitStore.get(identifier);

  if (!existing || now > existing.resetAt) {
    // Reset window
    rateLimitStore.set(identifier, {
      count: 1,
      resetAt: now + options.windowMs,
    });
    return {
      allowed: true,
      remaining: options.maxRequests - 1,
      retryAfter: 0,
    };
  }

  if (existing.count >= options.maxRequests) {
    const retryAfter = Math.ceil((existing.resetAt - now) / 1000);
    return {
      allowed: false,
      remaining: 0,
      retryAfter,
    };
  }

  existing.count++;
  return {
    allowed: true,
    remaining: options.maxRequests - existing.count,
    retryAfter: 0,
  };
}
```

---

## 8. Standalone Bundle Entry Point

**File: `src/viewer-bundle.ts`** (for UMD build)

```typescript
import React from 'react';
import { createRoot } from 'react-dom/client';
import { FlowViewer } from './components/FlowViewer';
import type { FlowViewerProps, ViewerConfig } from './components/FlowViewer';

/**
 * Standalone bundle export for embedding in other websites
 * Global: window.FlowViewer
 */

export const FlowViewerBundle = {
  /**
   * Render a flow viewer in a DOM element
   * Usage:
   *   FlowViewer.render({
   *     flowId: 'abc123',
   *     apiKey: 'pk_xyz',
   *     config: { showMiniMap: true }
   *   }, '#my-flow')
   */
  render: (options: {
    flowId: string;
    apiKey: string;
    config?: ViewerConfig;
  }, selector: string) => {
    const container = document.querySelector(selector);
    if (!container) {
      console.error(`Container not found: ${selector}`);
      return;
    }

    // Fetch flow data
    fetch(`https://flows.app/api/flows/public/${options.flowId}`, {
      headers: {
        'Authorization': `Bearer ${options.apiKey}`,
      },
    })
      .then(res => res.json())
      .then(data => {
        // Render viewer
        const root = createRoot(container as HTMLElement);
        root.render(
          React.createElement(FlowViewer, {
            flowData: {
              nodes: data.nodes,
              edges: data.edges,
              viewport: data.viewport,
            },
            config: options.config,
          } as FlowViewerProps)
        );
      })
      .catch(error => {
        console.error('Failed to load flow:', error);
        container.innerHTML = '<p>Failed to load flow diagram</p>';
      });
  },

  /**
   * Export the component for advanced usage
   */
  Component: FlowViewer,
};

// Expose globally
if (typeof window !== 'undefined') {
  (window as any).FlowViewer = FlowViewerBundle;
}

export default FlowViewerBundle;
```

---

## 9. Vite Configuration for UMD Build

**File: `vite.config.ts` - Update**

```typescript
import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import viteTsConfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'
import { cloudflare } from '@cloudflare/vite-plugin'

const config = defineConfig({
  plugins: [
    cloudflare({ viteEnvironment: { name: 'ssr' } }),
    viteTsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
  ],
  // Add UMD build configuration
  build: {
    lib: process.env.BUILD_EMBED === 'true'
      ? {
          entry: 'src/viewer-bundle.ts',
          name: 'FlowViewer',
          fileName: (format) => `flow-viewer.${format}.js`,
          formats: ['umd'],
        }
      : undefined,
  },
})

export default config
```

---

## 10. Package.json Scripts Update

```json
{
  "scripts": {
    "dev": "vite dev --port 3000",
    "build": "vite build",
    "build:embed": "BUILD_EMBED=true vite build",
    "serve": "vite preview",
    "test": "vitest run",
    "deploy": "npm run build && wrangler deploy",
    "preview": "npm run build && vite preview",
    "cf-typegen": "wrangler types",
    "db:generate": "drizzle-kit generate",
    "db:migrate:local": "wrangler d1 execute flow-builder-db --local --file=./drizzle/0000_magical_mikhail_rasputin.sql",
    "db:migrate:remote": "wrangler d1 execute flow-builder-db --remote --file=./drizzle/0000_magical_mikhail_rasputin.sql",
    "db:studio": "drizzle-kit studio"
  }
}
```

---

## Usage Examples

### For Users (Iframe)

```html
<iframe 
  src="https://flows.app/viewer/abc123def456"
  width="100%"
  height="600"
  sandbox="allow-same-origin"
  title="My Flow Diagram"
></iframe>
```

### For Developers (API)

```javascript
// Fetch flow data
fetch('https://flows.app/api/flows/public/abc123def456', {
  headers: {
    'Authorization': 'Bearer pk_test_123abc'
  }
})
.then(res => res.json())
.then(data => {
  console.log('Nodes:', data.nodes);
  console.log('Edges:', data.edges);
})
.catch(err => console.error('Failed to load flow:', err));
```

### For JavaScript Bundle Users

```html
<script src="https://cdn.flows.app/flow-viewer.umd.js"></script>
<div id="my-flow" style="width: 100%; height: 600px;"></div>

<script>
FlowViewer.render({
  flowId: 'abc123def456',
  apiKey: 'pk_test_123abc',
  config: {
    showMiniMap: true,
    showControls: true,
    interactive: true
  }
}, '#my-flow');
</script>
```

