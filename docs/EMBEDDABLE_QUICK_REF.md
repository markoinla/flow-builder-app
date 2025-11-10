# Flow Builder - Quick Reference Guide

## Project at a Glance

| Aspect | Details |
|--------|---------|
| **Type** | Visual flow/diagram builder |
| **Core Library** | React Flow (@xyflow/react v12.9.2) |
| **Frontend Framework** | TanStack Start + TanStack Router |
| **Backend** | Cloudflare Workers (serverless) |
| **Database** | Cloudflare D1 (SQLite) + Drizzle ORM |
| **Authentication** | Better Auth (email/password) |
| **Styling** | Tailwind CSS v4 + Radix UI |
| **Language** | TypeScript 5.7 (strict mode) |
| **Build Tool** | Vite 7 + Wrangler CLI |
| **Current Status** | MVP Phase 4 (flow persistence - auth context blocked) |

## Core Components

### Client-Side
- **FlowBuilder.tsx** (495 lines) - Main editor with full state mgmt
- **CustomNode.tsx** (90 lines) - Rectangle node renderer
- **IconNode.tsx** (160 lines) - Icon-based node renderer  
- **NodePalette.tsx** - Drag-drop node type sidebar
- **RectangleTool.tsx** - Canvas drawing functionality

### Server-Side
- **GET /api/flows** - List user's flows
- **POST /api/flows** - Create flow
- **GET /api/flows/:id** - Fetch flow + data
- **PUT /api/flows/:id** - Update flow
- **DELETE /api/flows/:id** - Delete flow
- **GET /api/node-types** - List node types
- **POST /api/node-types** - Create node type
- **PUT /api/node-types/:id** - Update node type
- **DELETE /api/node-types/:id** - Delete node type

## Database Tables

```
flows {
  id, userId, name, description, createdAt, updatedAt
}

flow_data {
  id, flowId (FK), nodes (JSON), edges (JSON), 
  viewport (JSON), createdAt, updatedAt
}

node_types {
  id, userId, name, type, style (JSON), iconStyle (JSON),
  handles (JSON), createdAt, updatedAt
}

users, sessions, accounts, verifications (Better Auth)
```

## Key Files Structure

```
src/
├── components/
│   ├── FlowBuilder.tsx          # Main editor
│   ├── CustomNode.tsx           # Standard node
│   ├── IconNode.tsx             # Icon node
│   ├── NodePalette.tsx          # Node selector
│   ├── RectangleTool.tsx        # Drawing tool
│   ├── DrawingToolbar.tsx       # Tool UI
│   ├── ProtectedRoute.tsx       # Auth wrapper
│   └── ui/                      # Radix UI components
├── lib/
│   ├── auth.ts                  # Better Auth server config
│   ├── auth-client.ts           # Better Auth hooks
│   ├── api.ts                   # API client
│   └── utils.ts                 # Utilities
├── db/
│   ├── index.ts                 # Drizzle instance
│   └── schema.ts                # DB schema
├── types/
│   └── node-types.ts            # Node type definitions
├── routes/
│   ├── __root.tsx               # Root layout
│   ├── index.tsx                # Homepage
│   ├── builder/index.tsx         # Builder page
│   ├── auth/login.tsx           # Login
│   ├── auth/signup.tsx          # Signup
│   └── api/                     # REST endpoints
└── styles.css                   # Global styles
```

## Tech Stack Breakdown

### Dependencies Count
- **Total**: ~326 npm packages
- **React ecosystem**: 19.2 + TanStack stack
- **UI Libraries**: 9 Radix UI packages
- **Icons**: Lucide React (1000+ icons)
- **Database**: Drizzle ORM + Better Auth

### Bundle Size Estimates
| Library | Gzipped Size |
|---------|-------------|
| React 19 | ~42KB |
| React Flow | ~120KB |
| Radix UI (subset) | ~30KB |
| Tailwind CSS (used) | ~30-50KB |
| Lucide React | ~80KB (full, tree-shakeable) |
| **Standalone embed total** | ~250-300KB |

## Development Commands

```bash
npm run dev                    # Start dev server (:3000)
npm run build                  # Production build
npm run preview                # Test production build
npm run deploy                 # Build + deploy to Cloudflare
npm run test                   # Run Vitest tests
npm run db:studio              # Open Drizzle DB GUI
npm run db:generate            # Generate migrations
npm run db:migrate:local       # Apply migrations locally
npm run db:migrate:remote      # Apply to production
npm run cf-typegen             # Generate Worker types
```

## Current Limitations

1. **Authentication context blocked** - Can't access userId in API routes (TanStack Start context issue)
   - All endpoints use `temp-user-id` placeholder
   - Prevents multi-user support

2. **No public flow viewing** - No existing public/shareable links

3. **Data persistence split** - localStorage fallback + incomplete D1 integration

4. **No flow discovery** - No "My Flows" page or flow listing UI

5. **Limited auth** - Only email/password, no OAuth

## Recommended Embeddable Architecture

### Phase 1: Iframe Embed (2-3 days)
1. Extract FlowViewer component (read-only)
2. Create `/viewer/:token` route
3. Implement token-based access control
4. Add embed generator UI

### Phase 2: Standalone Bundle (3-5 days)
1. Build UMD bundle with React/ReactFlow/Tailwind
2. Create API client for public flows
3. CSS scoping strategy (CSS-in-JS recommended)
4. CDN distribution setup

### Phase 3: Security & Polish (1-2 days)
1. Rate limiting
2. XSS sanitization
3. CORS headers
4. Documentation

## Security for Embeds

### Essential Controls
- Token-based access (JWT with expiration)
- API key system for programmatic access
- Rate limiting (per IP, per API key)
- CORS origin verification
- Content sanitization (XSS prevention)
- Data filtering (never expose userId, timestamps)

### Best Practices
- Use iframe sandbox attribute: `sandbox="allow-same-origin"`
- Add CSP headers on viewer route
- Validate node data structure before rendering
- HTML encode all user text
- Implement token rotation mechanism

## Embeddable Output Examples

### Iframe Embed
```html
<iframe 
  src="https://flows.app/viewer/abc123?token=xyz123"
  width="100%"
  height="600"
  sandbox="allow-same-origin"
  title="Embedded Flow Diagram"
/>
```

### Standalone Bundle
```html
<script src="https://cdn.flows.app/flow-viewer.umd.js"></script>
<div id="my-flow"></div>
<script>
  FlowViewer.render({
    flowId: 'abc123',
    apiKey: 'pk_xyz123',
    config: { showMiniMap: true }
  }, '#my-flow');
</script>
```

## API Endpoints to Add

### For Iframe Embed
```
GET /viewer/:token
- Public route, no auth required
- Returns full HTML page with viewer
- Token must be valid and not expired
```

### For API Access
```
GET /api/flows/public/:flowId
- Requires Authorization: Bearer {API_KEY}
- Returns: {nodes, edges, viewport, name}
- Rate limited to 1000 req/hour per key
```

## Implementation Checklist

### Core Viewer
- [ ] Extract FlowViewer component from FlowBuilder
- [ ] Make it read-only (hide editing UI)
- [ ] Create ViewerProps interface
- [ ] Add config options (controls, minimap toggle)
- [ ] Unit tests for rendering

### Public Access
- [ ] Create public_flows table in schema
- [ ] Implement token generation (JWT)
- [ ] Add /viewer/:token route
- [ ] Add /api/flows/public/:token endpoint
- [ ] Token validation & expiration

### Embed Generator
- [ ] "Generate Embed" button in builder
- [ ] Modal for token settings
- [ ] Copy-to-clipboard functionality
- [ ] Live preview window
- [ ] Token management UI

### Security
- [ ] Content sanitization
- [ ] CORS headers
- [ ] Rate limiting middleware
- [ ] XSS prevention tests
- [ ] CSRF protection

### Documentation
- [ ] Embed integration guide
- [ ] API documentation
- [ ] Code examples
- [ ] Security guidelines
- [ ] Troubleshooting

## Quick Debug Commands

```bash
# Check database connectivity
npm run db:studio

# View recent migrations
ls -la drizzle/

# Check built assets
ls -la dist/client/
ls -la dist/server/

# View type errors (without building)
npx tsc --noEmit

# Check specific component
npx vitest run src/components/FlowBuilder.test.ts
```

## Performance Tips

### For Embeds
1. **Lazy load React Flow** - Large library, worth dynamic import
2. **Tree-shake Lucide** - Only import used icons
3. **CSS optimization** - Use Tailwind's content purge for embeds
4. **Code splitting** - Separate viewer from editor bundles
5. **Caching** - Long TTL on public viewer routes

### Optimization Targets
- Remove dev-only libraries (TanStack DevTools)
- Tree-shake authentication code for public routes
- Use dynamic imports for optional features
- Minify and compress all assets
- Implement HTTP/2 push for critical resources

## File Size Optimization

### Current Full Build
- ~300KB gzipped total
- Includes full React, React Flow, Tailwind, UI libs

### Optimized Embed Build
- Target: ~150-200KB gzipped
- Remove: Auth, routing, unused UI components
- Add: CSS-in-JS for styling isolation
- Use: Dynamic imports for icons

### Estimated Final Size
- Core viewer: ~150KB
- With config options: ~180KB
- With API client: ~200KB
- With docs/types: ~220KB

## Next Steps (Recommended)

1. **First week**: Build iframe embed (2-3 days work) + token system
2. **Second week**: Standalone bundle + CSS scoping strategy  
3. **Final polish**: Security audit, documentation, optimization

**Total estimated effort**: 2-3 weeks for both embed options

