# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **visual flow/diagram builder** application built with React Flow, allowing users to create, edit, and save node-based diagrams. The application features a drag-and-drop interface with customizable node types, real-time canvas editing, and persistent storage.

**Tech Stack:**
- **Frontend:** React 19 + TanStack Start (SSR framework) + TanStack Router (file-based routing)
- **Diagram Engine:** React Flow (@xyflow/react)
- **Backend:** Cloudflare Workers (serverless)
- **Database:** Cloudflare D1 (SQLite) with Drizzle ORM
- **Authentication:** Better Auth
- **UI:** Radix UI primitives + Tailwind CSS v4
- **Build:** Vite 7

## Development Commands

### Local Development
```bash
npm run dev                 # Start dev server on http://localhost:3000
npm run test                # Run Vitest test suite
npm run db:studio           # Open Drizzle Studio (database GUI)
```

### Database Operations
```bash
npm run db:generate         # Generate migrations from schema changes
npm run db:migrate:local    # Apply migrations to local D1 database
npm run db:migrate:remote   # Apply migrations to remote Cloudflare D1
```

### Deployment
```bash
npm run build               # Production build
npm run deploy              # Build and deploy to Cloudflare Workers
npm run preview             # Preview production build locally
npm run cf-typegen          # Generate Cloudflare Worker types
```

## Architecture

### File-Based Routing (TanStack Router)

Routes are automatically generated from the file structure in `src/routes/`. The route tree is auto-generated in `routeTree.gen.ts` (never edit directly).

**Key Routes:**
- `/` - Homepage (`routes/index.tsx`)
- `/builder` - Main flow builder canvas (`routes/builder/index.tsx`)
- `/auth/login` - Login page (`routes/auth/login.tsx`)
- `/auth/signup` - Signup page (`routes/auth/signup.tsx`)
- `/api/auth/$` - Auth API catch-all (`routes/api/auth/$.ts`)

**Root Layout:** `routes/__root.tsx` provides the app shell with Header and Toaster components.

### Authentication System

**Better Auth** handles all authentication with email/password. Session duration is 7 days.

**Server Configuration:** `src/lib/auth.ts`
- Better Auth instance configured with Drizzle adapter
- Database tables: `users`, `sessions`, `accounts`, `verifications`

**Client Hooks:** `src/lib/auth-client.ts`
- `useSession()` - Get current session state
- `signIn({ email, password })` - Login
- `signUp({ email, password, name })` - Register
- `signOut()` - Logout

**Protected Routes:** Wrap with `<ProtectedRoute>` component to require authentication.

### Database Schema (`src/db/schema.ts`)

**Better Auth Tables:**
- `users` - User accounts
- `sessions` - Active sessions
- `accounts` - OAuth provider accounts
- `verifications` - Email verification tokens

**Application Tables:**
- `flows` - Flow metadata (userId, name, description)
- `flow_data` - Flow state (nodes, edges, viewport as JSON)

**Migration Workflow:**
1. Edit `src/db/schema.ts`
2. Run `npm run db:generate` to create migration
3. Run `npm run db:migrate:local` to apply locally
4. Test changes
5. Run `npm run db:migrate:remote` to apply to production

### React Flow Integration

**Main Components:**
- `FlowBuilder.tsx` - Canvas wrapper with state management
- `CustomNode.tsx` - Individual node component with handles
- `NodePalette.tsx` - Sidebar for node type management

**Node Type System:**
- Types defined in `src/types/node-types.ts`
- Each type has styling: `backgroundColor`, `borderColor`, `borderStyle`, `borderWidth`, `textColor`
- Default types: Default, Process, Decision, Data, Output
- Users can create/edit/delete custom node types

**Drag & Drop Flow:**
1. User drags from NodePalette
2. `onDragStart` sets node type data in `dataTransfer`
3. Canvas `onDrop` converts screen coords to flow coords
4. New node added to state with unique ID: `${nodeType.id}_${Date.now()}`

**Persistence:**
- Custom node types → `localStorage['customNodeTypes']`
- Current flow → `localStorage['currentFlow']`
- Server persistence planned but not implemented (Phase 4)

### UI Component System

All UI components use **Radix UI primitives** with custom Tailwind styling, installed via Shadcn CLI.

**Location:** `src/components/ui/`

**Install New Components:**
```bash
npx shadcn@latest add [component-name]
```

**Key Components in Use:**
- `alert-dialog` - Confirmation dialogs (replaces native `confirm()`)
- `sonner` - Toast notifications (replaces native `alert()`)
- `button`, `input`, `label`, `dialog`, `select`, `slider`, `separator`

**Toaster Setup:** `<Toaster />` component is mounted in `routes/__root.tsx` to enable toast notifications app-wide.

**Usage Pattern:**
```tsx
import { toast } from 'sonner';
toast.success('Flow saved!');
```

### TypeScript Configuration

**Path Alias:** `@/*` maps to `./src/*`

Example:
```typescript
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
```

**Strict Mode Enabled:**
- No implicit any
- No unused variables/parameters
- Strict null checks

## Important Non-Obvious Patterns

### 1. Cloudflare D1 Context Access

**Known Issue:** Auth route handlers cannot access the D1 database binding yet.

**Root Cause:** TanStack Start context not properly configured to pass Cloudflare env/context to route handlers.

**Impact:** Server-side flow persistence API is blocked until this is resolved.

**Workaround Needed:** Properly configure context middleware to access `env.DB` in route handlers.

### 2. localStorage Persistence Strategy

Currently, all data is persisted client-side only:

```typescript
// Custom node types
localStorage.setItem('customNodeTypes', JSON.stringify(customNodeTypes));

// Current flow
localStorage.setItem('currentFlow', JSON.stringify({ nodes, edges, savedAt }));
```

This is temporary until the backend API is implemented.

### 3. React Flow State Management

All flow state lives in `FlowBuilder` component:
- `nodes` - Array of nodes with position, type, data
- `edges` - Array of connections between nodes
- `customNodeTypes` - User-defined node type definitions

State hooks from React Flow:
- `useNodesState()` - Manages nodes with built-in drag/delete
- `useEdgesState()` - Manages edges with built-in connect/delete

### 4. Node Handle Configuration

Nodes have two connection handles:
- **Target (top):** Can receive incoming connections
- **Source (bottom):** Can create outgoing connections

This is defined in `CustomNode.tsx` using React Flow's `<Handle>` components.

### 5. Session Check Pattern

Protected routes check auth status before rendering:

```typescript
const { data: session, isPending } = useSession();

if (isPending) return <div>Loading...</div>;
if (!session) return <Navigate to="/auth/login" />;
```

The `useSession()` hook automatically fetches session from Better Auth.

## Project Status

**Current Phase:** Phase 4 - Flow Persistence (In Progress)

**Completed:**
- ✅ Database setup (Cloudflare D1 + Drizzle)
- ✅ Authentication (Better Auth)
- ✅ React Flow UI with drag & drop
- ✅ Custom node type management
- ✅ localStorage persistence

**Blocked:**
- ⏸️ Server-side flow CRUD API (waiting on D1 context fix)
- ⏸️ "My Flows" management page

**Planned:**
- 🔲 Flow sharing/export features
- 🔲 Collaborative editing
- 🔲 Enhanced styling system
- 🔲 Analytics/monitoring

## Development Guidelines

### Adding New Routes

1. Create file in `src/routes/[path].tsx`
2. Export a Route using `createFileRoute()`
3. Route tree auto-generates on save

Example:
```typescript
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/my-page')({
  component: MyPageComponent,
});

function MyPageComponent() {
  return <div>My Page</div>;
}
```

### Database Schema Changes

1. Edit `src/db/schema.ts`
2. `npm run db:generate` - Creates migration file
3. `npm run db:migrate:local` - Test locally
4. Verify in Drizzle Studio
5. `npm run db:migrate:remote` - Deploy to production

### Using Better Auth

**Server-side (route handlers):**
```typescript
import { auth } from '@/lib/auth';
const session = await auth.api.getSession({ headers: request.headers });
```

**Client-side (components):**
```typescript
import { useSession, signIn } from '@/lib/auth-client';

const { data: session } = useSession();
await signIn.email({ email, password });
```

### Adding UI Components

Always use Shadcn to maintain consistency:
```bash
npx shadcn@latest add [component-name]
```

Components are automatically styled with Tailwind and configured for the project theme.

### Working with React Flow

**Adding New Node Types:**
1. Update `DEFAULT_NODE_TYPES` in `src/types/node-types.ts`
2. Or use the NodePalette UI to create custom types

**Accessing Flow State:**
- Use `useNodesState()` and `useEdgesState()` from React Flow
- Never mutate state directly - use setter functions

**Custom Node Development:**
- Nodes must include `<Handle>` components for connections
- Use `data` prop to pass custom properties
- Style with Tailwind classes

## Design System Guidelines

### Icons
- **ALWAYS use Lucide React icons** - never use emojis or Unicode symbols
- Import from `lucide-react`: `import { IconName } from 'lucide-react'`
- Lucide provides 1000+ consistent, customizable SVG icons
- Icons can be styled with className (size, color, etc.)

**Example:**
```tsx
import { Plus, Trash2, Edit } from 'lucide-react';

<Button>
  <Plus className="h-4 w-4 mr-2" />
  Add Item
</Button>
```

### Text Content
- **Never use emojis in user-facing text** - they are inconsistent across platforms
- Use descriptive text and Lucide icons for visual communication
- Focus on clarity and professionalism in all UI text

### Component Patterns
- All buttons with icons should have the icon as a child component
- Use consistent icon sizing: `h-4 w-4` for inline icons, `h-5 w-5` for standalone
- Icons should have semantic meaning matching their action

## Configuration Files

**Cloudflare Workers:** `wrangler.jsonc`
- D1 binding: `DB` → `flow-builder-db`
- Compatibility date: 2025-09-02

**Database:** `drizzle.config.ts`
- Schema: `src/db/schema.ts`
- Migrations: `drizzle/` directory

**TypeScript:** `tsconfig.json`
- Path alias: `@/*` → `./src/*`
- Strict mode enabled

**Vite:** `vite.config.ts`
- Cloudflare plugin for Workers integration
- TanStack Router plugin for file-based routing
- Tailwind CSS v4 plugin

## Testing

**Framework:** Vitest with jsdom

**Run Tests:**
```bash
npm run test
```

**Current Coverage:** Minimal - testing framework is set up but few tests written.

**Recommended Test Coverage:**
- Component rendering and interactions
- Node type CRUD operations
- Auth flow validation
- Database query mocking
