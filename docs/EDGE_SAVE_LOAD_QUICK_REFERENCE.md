# Flow Builder: Edge Save/Load - Quick Reference

## Key Files & Locations

| Component | File Path | Lines | Status |
|-----------|-----------|-------|--------|
| Database Schema | `src/db/schema.ts` | 102-137 | CORRECT |
| Save API (Update) | `src/routes/api/flows/$id.ts` | 61-115 | POTENTIAL BUG |
| Save API (Create) | `src/routes/api/flows/index.ts` | 45-100 | CORRECT |
| Load API | `src/routes/api/flows/$id.ts` | 19-59 | CORRECT |
| API Client | `src/lib/api.ts` | 128-144 | CORRECT |
| UI Component | `src/components/FlowBuilder.tsx` | 76-901 | CORRECT |

---

## The Bug

**Location:** `/src/routes/api/flows/$id.ts` line 98-107

**Problem Code:**
```typescript
if (body.nodes || body.edges || body.viewport) {
  await db.update(flowData).set({
    nodes: body.nodes,      // Can be undefined!
    edges: body.edges,      // Can be undefined!
    viewport: body.viewport, // Can be undefined!
    updatedAt: new Date(),
  }).where(eq(flowData.flowId, id));
}
```

**Why it fails:**
- When `body.edges` is `undefined`, Drizzle ORM sets the database column to NULL
- This overwrites previously saved edges
- Result: Edges disappear after save/reload cycle

---

## The Fix

**Option 1: Conditional Property Spread (Recommended)**
```typescript
const updateData: Record<string, any> = { updatedAt: new Date() };
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

**Option 2: Spread Syntax**
```typescript
await db.update(flowData).set({
  ...(body.nodes !== undefined && { nodes: body.nodes }),
  ...(body.edges !== undefined && { edges: body.edges }),
  ...(body.viewport && { viewport: body.viewport }),
  updatedAt: new Date(),
}).where(eq(flowData.flowId, id));
```

---

## Save Flow (Working Correctly)

```
User clicks Save
    ↓
handleSave() in FlowBuilder.tsx (line 455)
    ↓
flowsApi.save(flowId, name, description, nodes, edges)
    ↓ (nodes and edges passed here - GOOD)
flowsApi.update(flowId, { nodes, edges, ... })
    ↓
PUT /api/flows/{id}
    ↓
BUG: edges might be undefined in request
```

---

## Load Flow (Working Correctly)

```
Component mounts with flowId
    ↓
useEffect loads flow (line 200)
    ↓
flowsApi.get(flowId)
    ↓
GET /api/flows/{id}
    ↓
Database returns flowData with edges JSON
    ↓
setEdges(migrateEdgeAnimations(flowData.edges))
    ↓
Canvas displays edges - BUT they might be NULL from previous save!
```

---

## Database Tables

### flows (Flow metadata)
```
id          │ user_id │ name           │ description         │ created_at │ updated_at
────────────┼─────────┼────────────────┼─────────────────────┼────────────┼────────────
abc-123     │ user-1  │ My Workflow    │ A test flow         │ ...        │ ...
```

### flow_data (Flow content)
```
id       │ flow_id │ nodes              │ edges              │ viewport
─────────┼─────────┼────────────────────┼────────────────────┼──────────────────────
xyz-789  │ abc-123 │ [...JSON array...] │ [...JSON array...] │ {"x":0,"y":0,"zoom":1}
```

**Problem:** When PUT request sets `edges: undefined`, this column becomes NULL

---

## Testing Checklist

- [ ] Create a flow with nodes and edges
- [ ] Save the flow (should update database)
- [ ] Reload the page
- [ ] Check if edges appear
- [ ] Check `flow_data.edges` in database (use `npm run db:studio`)
- [ ] Verify edges are JSON array, not NULL

---

## Code Snippets for Debugging

### Enable logging in PUT endpoint:
```typescript
console.log('Received body:', JSON.stringify(body, null, 2));
console.log('About to update with:', { nodes: body.nodes, edges: body.edges });
```

### Check React Flow state before save:
```typescript
const handleSave = useCallback(async () => {
  console.log('SAVE: Current edges state:', edges);
  console.log('SAVE: Edges length:', edges.length);
  // ... rest of save logic
}, [edges, ...]);
```

### Browser DevTools Network tab:
- Find the PUT request to `/api/flows/{id}`
- Check Request tab > Payload
- Verify edges array is present and has data
- Check Response status is 200

---

## Edge State Management (React Flow)

The component uses React Flow's built-in hooks:
```typescript
const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
```

Edges are modified by:
- `onConnect` - When users drag connections between nodes
- `onEdgesChange` - When users delete or modify edges
- `setEdges` - Direct updates in handler functions

This is all standard React Flow and working correctly.

---

## Summary

**Issue:** Edges disappear after save/reload
**Root Cause:** PUT endpoint sends undefined values to database, overwriting edges with NULL
**Severity:** High - Core functionality broken
**Fix Complexity:** Low - 10 lines of code change
**Location:** `src/routes/api/flows/$id.ts` lines 98-107

