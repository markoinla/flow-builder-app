# Flow Builder - Embeddable Version Architecture Analysis

## Executive Summary

This is a **React Flow-based visual diagram builder** deployed on **Cloudflare Workers** with **SQLite (D1) persistence**. The application allows users to create, edit, and save node-based flow diagrams with customizable node types.

The codebase is well-structured and ready for embeddable versions. Both **iframe** and **standalone JS bundle** approaches are feasible with minimal modifications.

---

## 1. Technology Stack

### Frontend Framework
- **React 19.2.0** - Latest React with hooks support
- **TanStack Start 1.132.0** - Full-stack meta-framework (SSR + SSG capabilities)
- **TanStack Router 1.132.0** - File-based routing with type safety
- **TypeScript 5.7.2** - Strict mode enabled for safety

### Diagram Rendering
- **@xyflow/react 12.9.2** - React Flow library (node-edge based diagrams)
  - Supports drag-drop, custom nodes, edge connections
  - Built-in zooming, panning, minimap
  - Node types: standard, icon-based
  - Handles: configurable connection points (top, right, bottom, left)

### UI & Styling
- **Radix UI** - Headless component primitives
  - Alert dialogs, buttons, inputs, labels, dialogs, selects, sliders, tabs, tooltips
- **Tailwind CSS v4** - Utility-first styling via Vite plugin
- **Lucide React 0.544.0** - 1000+ SVG icons (no emoji usage)
- **Sonner 2.0.7** - Toast notifications
- **class-variance-authority & tailwind-merge** - Component style composition

### Backend & Database
- **Cloudflare Workers** - Serverless compute (entry point via TanStack Start)
- **Cloudflare D1** - SQLite database (serverless)
- **Drizzle ORM 0.44.7** - Type-safe database queries
- **Better Auth 1.3.34** - Authentication system (email/password)

### Build & Deployment
- **Vite 7.1.7** - Fast bundler with Cloudflare plugin support
- **Wrangler 4.46.0** - Cloudflare Workers CLI
- **Vitest 3.0.5** - Unit testing framework
- **@cloudflare/vite-plugin 1.13.8** - Cloudflare Workers integration

---

## 2. Current Flow Rendering Architecture

### Core Components

#### FlowBuilder.tsx (495 lines)
- **Main canvas wrapper** with full state management
- Uses React Flow hooks: `useNodesState()`, `useEdgesState()`
- Manages custom node types (loaded from D1 database)
- Implements drag-drop for node palette
- Features:
  - Node creation via palette drag-drop
  - Edge connection between nodes
  - Canvas operations (save, clear, delete)
  - Real-time node count display
  - localStorage fallback persistence

#### CustomNode.tsx (90 lines)
- Standard node renderer for rectangular flow nodes
- Properties:
  - Customizable styles (background, border color/width/style, text color, border radius)
  - Opacity support (0-100 scale)
  - Resizable via NodeResizer
  - Configurable connection handles (top, right, bottom, left)
  - Individual handle can be: "source", "target", or "both"

#### IconNode.tsx (160 lines)
- Icon-based node renderer using Lucide icons
- Properties:
  - Dynamic icon selection from Lucide library
  - Icon sizing and coloring
  - Label positioning (top/bottom)
  - Background color with opacity
  - Border customization
  - Configurable handles

#### NodePalette.tsx
- Left sidebar for node type management
- Implements drag-start for node creation
- UI for creating/editing/deleting node types
- Organizes nodes by category (standard, icon-based)

#### RectangleTool.tsx & RectangleNode.tsx
- Drawing tool for adding shapes to canvas
- Complementary to node-based design

### Node Type System

**CustomNodeType Interface:**
```typescript
interface CustomNodeType {
  id: string;
  name: string;
  type?: 'standard' | 'icon';
  style?: NodeStyle;           // For standard nodes
  iconStyle?: IconNodeStyle;   // For icon nodes
  handles?: HandleConfig;      // Connection point configuration
}
```

**Default Node Types (10 total):**
1. Standard nodes: Default, Process, Decision, Data, Output
2. Icon nodes: Database, Server, Cloud, Network, Security

**Node Style Customization:**
- Background color, opacity
- Border (color, style: solid/dashed/dotted, width, radius)
- Text color
- Icon and label positioning

### Data Flow

1. **Node Creation**: User drags from palette → `onDrop` handler converts screen position to flow coordinates → new Node added to state with unique ID
2. **Connections**: User drags from handle → React Flow's `onConnect` hook → Edge added to state
3. **State Management**: All state lives in FlowBuilder component via React Flow hooks
4. **Persistence**: Save button calls `flowsApi.save()` → API endpoint writes to D1

---

## 3. Current API Routes & Database Schema

### Database Schema (Drizzle ORM)

#### Authentication Tables (Better Auth)
- `users` - User accounts
- `sessions` - Active sessions (7-day duration)
- `accounts` - OAuth provider accounts
- `verifications` - Email verification tokens

#### Application Tables
```sql
-- Flow metadata
flows (
  id: text (PK),
  userId: text,
  name: text,
  description: text?,
  createdAt: timestamp,
  updatedAt: timestamp
)

-- Flow diagram data
flow_data (
  id: text (PK),
  flowId: text (FK → flows.id, CASCADE delete),
  nodes: JSON,
  edges: JSON,
  viewport: JSON {x, y, zoom},
  createdAt: timestamp,
  updatedAt: timestamp
)

-- Custom node type definitions
node_types (
  id: text (PK),
  userId: text,
  name: text,
  type: 'standard' | 'icon',
  style: JSON?,
  iconStyle: JSON?,
  handles: JSON,
  createdAt: timestamp,
  updatedAt: timestamp
)
```

### REST API Endpoints

#### Flows API
```
GET  /api/flows              → List user's flows
POST /api/flows              → Create new flow
GET  /api/flows/:id          → Get flow + flow_data
PUT  /api/flows/:id          → Update flow metadata & data
DELETE /api/flows/:id        → Delete flow
```

**Request/Response Examples:**

```bash
# Create flow
POST /api/flows
{
  "name": "My Process Flow",
  "description": "A workflow diagram",
  "nodes": [{id, type, position, data}],
  "edges": [{id, source, target}],
  "viewport": {x, y, zoom}
}

# Get flow
GET /api/flows/flow-id-123
Response:
{
  "flow": {id, userId, name, description, createdAt, updatedAt},
  "flowData": {id, flowId, nodes, edges, viewport}
}

# Update flow
PUT /api/flows/flow-id-123
{
  "name": "Updated Name",
  "nodes": [...],
  "edges": [...],
  "viewport": {...}
}
```

#### Node Types API
```
GET  /api/node-types         → List user's custom node types
POST /api/node-types         → Create new node type
PUT  /api/node-types/:id     → Update node type
DELETE /api/node-types/:id   → Delete node type
```

#### Authentication API
```
POST /api/auth/sign-in        → Email/password login (Better Auth)
POST /api/auth/sign-up        → Registration
POST /api/auth/sign-out       → Logout
GET  /api/auth/session        → Get current session
```

### Current Limitations
- **Authentication context not available in route handlers** (BLOCKED - TanStack Start context issue)
- All API endpoints currently use `temp-user-id` placeholder
- userId should come from session but context passing is broken
- This blocks true multi-user support in current implementation

---

## 4. Routing Structure

### File-Based Routing (TanStack Router)

```
src/routes/
├── __root.tsx                    # Root layout (header, toaster)
├── index.tsx                     # Homepage (landing page)
├── builder/index.tsx             # Main builder page (/builder)
├── auth/
│   ├── login.tsx                 # /auth/login
│   └── signup.tsx                # /auth/signup
├── api/
│   ├── auth/
│   │   └── $.ts                  # Auth catch-all (Better Auth handling)
│   ├── flows/
│   │   ├── index.ts              # /api/flows (GET/POST)
│   │   └── $id.ts                # /api/flows/:id (GET/PUT/DELETE)
│   └── node-types/
│       ├── index.ts              # /api/node-types (GET/POST)
│       └── $id.ts                # /api/node-types/:id (PUT/DELETE)
└── demo/                         # Demo routes (can be deleted)
```

### No Existing Public Viewer Route
- No public flow viewer exists currently
- No anonymous access routes
- Perfect opportunity for embeddable viewer

---

## 5. Existing Viewer Components

### Current State
- **No dedicated viewer component exists**
- FlowBuilder is edit-focused (includes save, clear, edit palette)
- Could be refactored to extract read-only flow renderer

### Rendering Capability
The codebase already has the rendering logic:
- ReactFlow component handles node/edge display
- CustomNode and IconNode can render without editing
- Handles are only for editing - can be hidden
- Canvas controls (zoom, pan) can be toggled

---

## 6. Build & Bundler Configuration

### Vite Configuration (vite.config.ts)
```typescript
plugins: [
  cloudflare({ viteEnvironment: { name: 'ssr' } }),  // Worker support
  viteTsConfigPaths(),                                 // Path aliases
  tailwindcss(),                                       // CSS processing
  tanstackStart(),                                     // File-based routing
  viteReact(),                                         // JSX compilation
]
```

### Package.json Scripts
```bash
npm run dev              # Vite dev server on :3000
npm run build            # Production build (dist/client + dist/server)
npm run serve/preview    # Preview production build
npm run test             # Vitest test runner
npm run deploy           # Build + wrangler deploy to Cloudflare
npm run db:generate      # Generate DB migrations
npm run db:migrate:local # Apply migrations locally
npm run db:migrate:remote # Apply migrations to production D1
```

### Output Structure
- `dist/client/` - Client-side bundles (JS, CSS, assets)
- `dist/server/` - Server bundles (Cloudflare Worker entry)
- `dist/server/.vite/manifest.json` - Asset manifest for SSR

### Build Target
- **ES2022** - Modern browser support
- **Module**: ESNext (no transpilation to CommonJS)
- **Bundler mode**: Full tree-shaking, code splitting

---

## 7. Dependencies Analysis

### Critical Dependencies (for embeddable)
- `react` 19.2 - Required
- `@xyflow/react` 12.9.2 - Diagram rendering (required)
- `@radix-ui/*` packages - UI components (9 packages)
- `tailwindcss` 4.0.6 - Styling
- `lucide-react` 0.544.0 - Icons
- `sonner` 2.0.7 - Notifications
- `@tanstack/react-router` - Routing (not needed for embedded viewer)

### Size Estimates
- React: ~42KB (gzipped)
- React Flow: ~120KB (gzipped)
- Radix UI (subset): ~30KB
- Tailwind CSS (output): ~20-50KB (depends on classes used)
- Lucide React: ~80KB (full, can tree-shake)
- **Total estimated**: ~300-400KB gzipped for full build

### Tree-Shake Opportunities
- Remove TanStack Router (not needed in embed)
- Remove TanStack DevTools
- Remove authentication components
- Use dynamic imports for Lucide icons
- Chunk by feature

---

## 8. Security Considerations for Public Embedding

### Current State
- No public/anonymous routes exist
- All endpoints require userId (currently placeholder)
- No flow sharing/public link mechanism exists

### For Embeddable Version

#### 1. Flow Access Control
- Create public flow IDs (different from internal IDs)
- Generate signed tokens for public access
- Implement rate limiting on viewer endpoint
- Add IP whitelisting option

#### 2. Data Leakage Prevention
- Flow viewer should NOT expose:
  - userId
  - createdAt/updatedAt
  - Full flow metadata
  - Raw flow data structure
- Only expose: nodes, edges, viewport state, flow name/description

#### 3. XSS Prevention
- Sanitize all text nodes before rendering
- Validate node data structure
- Sandbox iframe (use `sandbox` attribute)
- CSP headers on viewer route

#### 4. CSRF Protection
- CORS configuration for embed domain
- SameSite cookie settings
- Origin verification for viewer requests

#### 5. Rate Limiting
- Public viewer endpoint should have rate limits
- Prevent scraping of all flows
- Implement pagination for flow lists

#### 6. API Authentication
- Create public API key system
- One key per account/project
- Separate public viewer credentials from user auth
- Rotate keys option

---

## Recommendations

### For Iframe Embed Approach

**Pros:**
- Isolated sandbox (browser security)
- Easiest to implement
- Works cross-domain
- No CSP conflicts
- Simple styling isolation

**Implementation:**
1. Create `/viewer/:flowId` route (no auth required)
2. Implement flow signing with token-based access
3. Extract FlowBuilder → FlowViewer component (read-only)
4. Add embed generator UI in builder
5. Embed code: `<iframe src="https://flows.app/viewer/abc123?token=xyz" />`

**Code Size:** ~200KB gzipped (still includes React, React Flow, Tailwind)

**Estimated Work:** 2-3 days

---

### For Standalone JS Bundle Approach

**Pros:**
- No iframe overhead
- Direct DOM integration
- Shared styles with host site
- Smaller bundle size possible

**Cons:**
- CSS conflicts with host
- Requires ShadowDOM or CSS scoping
- More complex implementation
- Client needs to manage API calls

**Implementation:**
1. Create React component library wrapper
2. Build UMD bundle: `flow-viewer.umd.js`
3. Export FlowViewer component
4. Include with: `<script src="flow-viewer.umd.js"></script>`
5. Usage: `<div id="flow"></div><script>FlowViewer.render({flowId: 'abc'}, '#flow')</script>`

**Code Size:** ~250KB gzipped (can optimize with dynamic imports)

**CSS Approach Options:**
- CSS-in-JS (Emotion/Styled) - no conflicts
- CSS Modules - scoped classes
- PostCSS with namespace prefix
- Tailwind with CSS layer isolation

**Estimated Work:** 3-5 days

---

### Recommended Hybrid Approach (Best)

**Create both with shared infrastructure:**

1. **Core `FlowViewer` component** (shared, read-only rendering)
   - Pure React component
   - No routing, no auth
   - Props: `{flowData: Flow, config?: ViewerConfig}`
   - Renders ReactFlow + handles

2. **Public Viewer Route** (`/viewer/:flowId`)
   - Uses FlowViewer component
   - Implements token-based access control
   - Iframe-friendly, full HTML page

3. **Standalone Bundle** (UMD)
   - Exports FlowViewer + API client
   - Bundled with React, React Flow, Tailwind
   - Can be lazy-loaded in parent app

4. **Embed Generator** (in builder)
   - Creates public links with tokens
   - Generates embed code for iframe/script
   - Shows live preview

**Architecture Benefits:**
- Single source of truth for rendering
- Reusable across iframe and bundle
- Type-safe across implementations
- Easy maintenance

---

## Implementation Roadmap

### Phase 1: Core Viewer Component (2 days)
- [ ] Extract FlowViewer component from FlowBuilder
- [ ] Make it read-only (remove editing UI)
- [ ] Create FlowViewerProps interface
- [ ] Add Storybook stories for testing
- [ ] Unit tests for rendering

### Phase 2: Public Viewer Route (2 days)
- [ ] Create `/viewer/:flowId` route
- [ ] Implement token-based access (`/api/flows/public/:token`)
- [ ] Add CORS headers for iframe embedding
- [ ] Security validation and sanitization
- [ ] Rate limiting middleware

### Phase 3: Embed Generator (1-2 days)
- [ ] UI in builder to generate tokens
- [ ] Copy-to-clipboard embed code
- [ ] Live preview in modal
- [ ] Token management (list, revoke, rotate)

### Phase 4: Standalone JS Bundle (3 days)
- [ ] Extract React/ReactFlow/Tailwind to separate entry
- [ ] UMD bundle configuration
- [ ] CSS scoping strategy
- [ ] API client for fetching flows
- [ ] minify and optimize for CDN

### Phase 5: Deploy & Polish (1 day)
- [ ] Create CDN distribution
- [ ] Documentation + examples
- [ ] Performance optimization
- [ ] Browser testing

---

## File Structure for New Features

```
src/
├── components/
│   ├── FlowViewer.tsx              # NEW: Read-only flow viewer
│   ├── FlowEmbedGenerator.tsx       # NEW: Embed code UI
│   ├── PublicFlowViewer.tsx         # NEW: Public viewer page
│   └── FlowBuilder.tsx              # REFACTOR: Remove viewer logic
├── lib/
│   ├── flow-viewer.ts              # NEW: Viewer logic shared
│   ├── embed-tokens.ts             # NEW: Token generation/validation
│   └── api.ts                       # EXTEND: Add public viewer endpoint
├── routes/
│   ├── viewer/
│   │   └── $token.tsx               # NEW: Public viewer route
│   └── api/
│       └── flows/
│           └── public/
│               └── $token.ts        # NEW: Public flow data API
└── types/
    └── viewer.ts                    # NEW: Public API types
```

---

## Key Files to Modify

1. **FlowBuilder.tsx** - Extract read-only viewer logic
2. **src/lib/api.ts** - Add public API endpoints
3. **src/db/schema.ts** - Add public_flows table for tokens
4. **vite.config.ts** - Add UMD bundle entry point
5. **package.json** - Add build:embed script

---

## Success Metrics

### Iframe Embed
- [ ] Embed works on external websites
- [ ] Security audit passes
- [ ] < 300KB bundle size (gzipped)
- [ ] Full functionality preserved
- [ ] Works in all modern browsers

### JS Bundle
- [ ] Can be loaded via CDN
- [ ] No conflicts with host CSS
- [ ] < 400KB bundle size (gzipped)
- [ ] API client works independently
- [ ] TypeScript types exported

---

## Conclusion

The Flow Builder codebase is **well-architected for embedding**. Both iframe and standalone bundle approaches are viable with estimated 2-3 weeks of development time for both solutions.

**Recommendation**: Implement the **Hybrid Approach** first (shared FlowViewer component + iframe route), then add the standalone bundle in Phase 4 for maximum flexibility.

The security infrastructure is straightforward - focus on token-based access control, data sanitization, and CORS configuration.

