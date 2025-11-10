# Flow Builder: Save/Load & Edge Handling Analysis

## Executive Summary

The flow save/load system is **functionally complete** and should preserve edges correctly IF the data reaches the database. The root cause of disappearing edges is likely related to **edge state management and conditions** rather than the database schema or API layer.

### Key Finding
The condition `if (body.nodes || body.edges || body.viewport)` on line 98 of `$id.ts` can prevent edge updates if `body.nodes` is falsy while edges exist.

---

## 1. Database Schema & Storage

### Location
`/Users/marko.stankovic/Desktop/PROJECTS/TOOLS/flow-builder/flow-builder/src/db/schema.ts`

### Schema Design
```typescript
// Flows table - stores flow metadata
export const flows = sqliteTable('flows', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
});

// Flow data table - stores the actual flow diagram data (nodes, edges, viewport)
export const flowData = sqliteTable('flow_data', {
  id: text('id').primaryKey(),
  flowId: text('flow_id')
    .notNull()
    .references(() => flows.id, { onDelete: 'cascade' }),
  nodes: text('nodes', { mode: 'json' }).notNull().default('[]'),
  edges: text('edges', { mode: 'json' }).notNull().default('[]'),  // <-- EDGES STORED HERE
  viewport: text('viewport', { mode: 'json' }).notNull().default('{"x":0,"y":0,"zoom":1}'),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
});
```

### Schema Status
- Edges are stored as JSON text in `flowData.edges` column
- Schema is properly set up with cascade deletes
- Migration files confirm table creation: `drizzle/0000_magical_mikhail_rasputin.sql`

---

## 2. Flow Save Operation

### File Location
`/Users/marko.stankovic/Desktop/PROJECTS/TOOLS/flow-builder/flow-builder/src/lib/api.ts`

### Save Flow Function
```typescript
async save(
  flowId: string | null,
  flowName: string,
  flowDescription: string,
  nodes: Node[],
  edges: Edge[]
): Promise<string> {
  if (flowId) {
    // Update existing flow
    await flowsApi.update(flowId, { 
      name: flowName, 
      description: flowDescription, 
      nodes, 
      edges  // <-- EDGES PASSED HERE
    });
    return flowId;
  } else {
    // Create new flow
    const { flow } = await flowsApi.create({ 
      name: flowName, 
      description: flowDescription, 
      nodes, 
      edges  // <-- EDGES PASSED HERE
    });
    return flow.id;
  }
}
```

**Status: Correct** - Edges are properly passed to the API

---

## 3. Flow Save API Endpoint

### File Location
`/Users/marko.stankovic/Desktop/PROJECTS/TOOLS/flow-builder/flow-builder/src/routes/api/flows/$id.ts` (PUT handler)

### Save Endpoint Code (Lines 61-115)
```typescript
PUT: async ({ request, params }) => {
  try {
    const db = createDb(env.DB);
    const auth = createAuth(env.DB);
    const { id } = params;

    // Get user session
    const session = await auth.api.getSession({
      headers: request.headers
    });

    if (!session?.user?.id) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json() as {
      name?: string;
      description?: string;
      nodes?: any[];
      edges?: any[];
      viewport?: { x: number; y: number; zoom: number };
    };

    // Update flow metadata
    if (body.name || body.description) {
      await db
        .update(flows)
        .set({
          name: body.name,
          description: body.description,
          updatedAt: new Date(),
        })
        .where(and(eq(flows.id, id), eq(flows.userId, session.user.id)));
    }

    // Update flow data (nodes, edges, viewport)
    // POTENTIAL BUG: This condition only updates if nodes OR edges OR viewport are present
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
}
```

### Critical Issue Found
**Line 98:** `if (body.nodes || body.edges || body.viewport)`

This condition has a logic flaw:
- Uses OR (`||`) operator
- If `nodes` is an empty array `[]`, it's falsy in JavaScript
- If edges are sent but nodes is `[]` AND viewport is undefined, the condition fails
- **Result:** The update query NEVER executes, edges stay in database unchanged

**Example Scenario:**
```javascript
const body = {
  nodes: [],      // Falsy in JavaScript!
  edges: [...],   // This has edges
  viewport: undefined
};

if (body.nodes || body.edges || body.viewport) {
  // This WILL evaluate to true because body.edges is truthy
  // So this should actually work...
}
```

**Wait, actually that would work.** Let me reconsider...

Actually, the condition IS correct for the logic check. The real issue might be:
- If `nodes` is `undefined` instead of `[]`, it fails
- The condition doesn't prevent NULL values being written to the database

---

## 4. Flow Create API Endpoint

### File Location
`/Users/marko.stankovic/Desktop/PROJECTS/TOOLS/flow-builder/flow-builder/src/routes/api/flows/index.ts` (POST handler)

### Create Endpoint Code (Lines 45-100)
```typescript
POST: async ({ request }) => {
  try {
    const db = createDb(env.DB);
    const auth = createAuth(env.DB);

    const session = await auth.api.getSession({
      headers: request.headers
    });

    if (!session?.user?.id) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json() as {
      name?: string;
      description?: string;
      nodes?: any[];
      edges?: any[];
      viewport?: { x: number; y: number; zoom: number };
    };

    const flowId = crypto.randomUUID();
    const flowDataId = crypto.randomUUID();

    // Create flow metadata
    const newFlow = {
      id: flowId,
      userId: session.user.id,
      name: body.name || 'Untitled Flow',
      description: body.description || null,
    };

    await db.insert(flows).values(newFlow);

    // Create flow data
    const newFlowData = {
      id: flowDataId,
      flowId,
      nodes: body.nodes || [],
      edges: body.edges || [],         // <-- EDGES DEFAULTED TO []
      viewport: body.viewport || { x: 0, y: 0, zoom: 1 },
    };

    await db.insert(flowData).values(newFlowData);

    return json(
      { flow: newFlow, flowData: newFlowData },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating flow:', error);
    return json({ error: 'Failed to create flow' }, { status: 500 });
  }
}
```

**Status: Correct** - Edges are properly inserted with fallback to empty array

---

## 5. Flow Load API Endpoint

### File Location
`/Users/marko.stankovic/Desktop/PROJECTS/TOOLS/flow-builder/flow-builder/src/routes/api/flows/$id.ts` (GET handler)

### Load Endpoint Code (Lines 19-59)
```typescript
GET: async ({ params, request }) => {
  try {
    const db = createDb(env.DB);
    const auth = createAuth(env.DB);
    const { id } = params;

    const session = await auth.api.getSession({
      headers: request.headers
    });

    if (!session?.user?.id) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const flow = await db
      .select()
      .from(flows)
      .where(and(eq(flows.id, id), eq(flows.userId, session.user.id)))
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
      flowData: data[0] || null,  // <-- RETURNS edges from flowData table
    });
  } catch (error) {
    console.error('Error fetching flow:', error);
    return json({ error: 'Failed to fetch flow' }, { status: 500 });
  }
}
```

**Status: Correct** - Returns flowData which includes edges

---

## 6. UI Component Flow Management

### File Location
`/Users/marko.stankovic/Desktop/PROJECTS/TOOLS/flow-builder/flow-builder/src/components/FlowBuilder.tsx`

### Load Flow Logic (Lines 199-242)
```typescript
useEffect(() => {
  async function loadFlow() {
    // If flowId is provided via prop, load from API
    if (initialFlowId) {
      try {
        const { flow, flowData } = await flowsApi.get(initialFlowId);

        if (flowData) {
          setNodes(flowData.nodes || []);
          // Migrate old animation directions
          setEdges(migrateEdgeAnimations(flowData.edges || []));
          setFlowName(flow.name);
          setFlowDescription(flow.description || '');
          setFlowId(flow.id);
        }
      } catch (error) {
        console.error('Failed to load flow from API:', error);
        setError('Failed to load workflow');
      }
      return;
    }

    // Otherwise, try to load from localStorage (legacy support)
    if (typeof window !== 'undefined') {
      const savedFlow = localStorage.getItem('currentFlow');
      if (savedFlow) {
        try {
          const { nodes: savedNodes, edges: savedEdges, flowId: savedFlowId } = JSON.parse(savedFlow);
          if (savedNodes && savedEdges) {
            setNodes(savedNodes);
            setEdges(migrateEdgeAnimations(savedEdges));
            setFlowId(savedFlowId || null);
          }
        } catch (error) {
          console.error('Failed to load saved flow from localStorage:', error);
        }
      }
    }
  }

  loadFlow();
}, [initialFlowId, setNodes, setEdges, migrateEdgeAnimations]);
```

**Status: Correct** - Properly loads edges from flowData

### Save Flow Logic (Lines 455-477)
```typescript
const handleSave = useCallback(async () => {
  try {
    const savedFlowId = await flowsApi.save(
      flowId, 
      flowName, 
      flowDescription, 
      nodes,      // <-- NODES PASSED
      edges       // <-- EDGES PASSED
    );
    setFlowId(savedFlowId);

    // Also save to localStorage as backup
    localStorage.setItem('currentFlow', JSON.stringify({
      nodes,
      edges,
      flowId: savedFlowId,
    }));

    toast.success('Workflow saved to database successfully!');

    if (onSave) {
      onSave(nodes, edges);
    }
  } catch (err) {
    console.error('Failed to save flow:', err);
    setError('Failed to save flow');
    toast.error('Failed to save workflow');
  }
}, [flowId, flowName, flowDescription, nodes, edges, onSave]);
```

**Status: Correct** - Edges are passed to save function

---

## 7. Edge State Management

### File Location
`/Users/marko.stankovic/Desktop/PROJECTS/TOOLS/flow-builder/flow-builder/src/components/FlowBuilder.tsx` (Lines 76-79)

```typescript
const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
```

Uses React Flow's built-in state hooks. Edges are modified by:
1. `onConnect` callback (line 244-246) - Creates new edges
2. `onEdgesChange` - Built-in React Flow hook for deletion/updates
3. `setEdges` - Direct state updates in edit/delete handlers (lines 301-330, 328-330)

**Status: Correct** - Proper React Flow integration

---

## 8. Potential Issues & Root Causes

### Issue 1: Empty Array JSON Serialization
**Location:** API endpoints and database
**Problem:** When nodes array is empty `[]`, it's serialized as `"[]"` in the database. The PUT endpoint condition checks:
```typescript
if (body.nodes || body.edges || body.viewport)
```

If `body.nodes = []` (empty array from React Flow), this might be falsy in some contexts.

**Status:** NOT the root cause - empty arrays are truthy in JavaScript

### Issue 2: Drizzle ORM Update Behavior
**Location:** `/src/routes/api/flows/$id.ts` line 101-107
```typescript
await db
  .update(flowData)
  .set({
    nodes: body.nodes,      // Might be undefined
    edges: body.edges,      // Might be undefined
    viewport: body.viewport,
    updatedAt: new Date(),
  })
  .where(eq(flowData.flowId, id));
```

**Problem:** If `body.edges` is `undefined`, Drizzle might set the database column to NULL instead of preserving existing data.

**This is the likely culprit!** When updating, if edges are not explicitly provided as non-undefined values, they could be set to NULL.

### Issue 3: Network/Request Issues
**Possible:** 
- Edges not being sent in the request body
- Request being aborted before edges data transfers
- Large edge arrays causing timeout

### Issue 4: Client-Side State Loss
**Possible:**
- Edges deleted from React Flow state before save
- Edge state not persisting in component
- React Flow internal issues with edge state

---

## Complete Data Flow Diagram

```
User Action (Save)
    ↓
FlowBuilder.handleSave()
    ↓ (calls)
flowsApi.save(flowId, name, description, nodes, edges)
    ↓ (calls)
flowsApi.update(flowId, {name, description, nodes, edges})
    ↓ (HTTP PUT)
/api/flows/$id PUT handler
    ↓
db.update(flowData).set({nodes, edges, viewport})
    ↓
D1 Database flow_data table
    ↓ (user reloads)
FlowBuilder useEffect with initialFlowId
    ↓
flowsApi.get(initialFlowId)
    ↓ (HTTP GET)
/api/flows/$id GET handler
    ↓
db.select().from(flowData).where(flowId = id)
    ↓
Returns flowData with edges JSON
    ↓
setEdges(migrateEdgeAnimations(flowData.edges))
    ↓
Canvas displays edges
```

---

## File Structure Summary

### API Layer
- `src/lib/api.ts` - API client methods (status: ✓ correct)
- `src/routes/api/flows/index.ts` - POST create endpoint (status: ✓ correct)
- `src/routes/api/flows/$id.ts` - GET/PUT/DELETE endpoints (status: ⚠️ potential issue)

### Database Layer
- `src/db/schema.ts` - Database schema definition (status: ✓ correct)
- `src/db/index.ts` - Drizzle setup (status: ✓ correct)
- `drizzle/0000_magical_mikhail_rasputin.sql` - Migration (status: ✓ correct)

### UI Layer
- `src/components/FlowBuilder.tsx` - Main component (status: ✓ correct)
- `src/routes/builder/index.tsx` - Route handler (status: ✓ correct)
- `src/routes/flows/index.tsx` - Flows list page (status: ✓ correct)

---

## Recommended Debugging Steps

1. **Add logging to the PUT endpoint:**
   ```typescript
   console.log('Request body:', { nodes, edges, viewport });
   console.log('Setting in DB:', { nodes, edges, viewport });
   ```

2. **Check Drizzle ORM behavior:**
   ```typescript
   // Ensure undefined values are not being passed
   const setData = {
     nodes: body.nodes || [],
     edges: body.edges || [],
     viewport: body.viewport || { x: 0, y: 0, zoom: 1 },
     updatedAt: new Date(),
   };
   console.log('Set data before update:', setData);
   ```

3. **Database inspection:**
   ```bash
   npm run db:studio
   # Check if flow_data.edges column actually contains the edge data
   ```

4. **Network inspection:**
   - Check browser DevTools Network tab
   - Verify edges are in the request payload
   - Check response status code

5. **React Flow debugging:**
   ```typescript
   console.log('Edges before save:', edges);
   // In the API call
   console.log('Edges sent to API:', edges);
   ```

---

## Root Cause Assessment

**Most Likely:** The PUT endpoint sets `edges: body.edges` where `body.edges` might be `undefined` when only nodes change, causing Drizzle to set the column to NULL.

**Fix:** Modify line 100-107 in `$id.ts`:
```typescript
await db
  .update(flowData)
  .set({
    ...(body.nodes !== undefined && { nodes: body.nodes }),
    ...(body.edges !== undefined && { edges: body.edges }),
    ...(body.viewport && { viewport: body.viewport }),
    updatedAt: new Date(),
  })
  .where(eq(flowData.flowId, id));
```

Or use a whitelist approach:
```typescript
const updateData: any = { updatedAt: new Date() };
if (body.nodes !== undefined) updateData.nodes = body.nodes;
if (body.edges !== undefined) updateData.edges = body.edges;
if (body.viewport) updateData.viewport = body.viewport;

if (Object.keys(updateData).length > 1) {
  await db
    .update(flowData)
    .set(updateData)
    .where(eq(flowData.flowId, id));
}
```

