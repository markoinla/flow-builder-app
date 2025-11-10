# Flow Builder - Embedding Guide

## Overview

Flow Builder now supports embedding flow diagrams into external websites using iframes. The embedded diagrams are read-only and support pan-only navigation (zoom is disabled).

## Features

✅ **Read-Only Display** - Users can view but not edit the diagram
✅ **Pan Navigation** - Users can pan the canvas by clicking and dragging
✅ **No Zoom** - All zoom interactions are disabled (mouse wheel, pinch, double-click)
✅ **Hover Cards** - Hover over nodes to see additional content (if configured)
✅ **Customizable Display** - Toggle controls, minimap, and background
✅ **Responsive** - Works with any iframe dimensions

## Quick Start

### 1. Create or Open a Flow

1. Start the Flow Builder application
2. Create a new flow or open an existing one
3. Add nodes, edges, and customize your diagram
4. Click **Save Flow** to save your changes

### 2. Generate Embed Code

1. Click the **Share/Embed** button in the toolbar (appears after saving)
2. A dialog will open with embedding options
3. Configure the display options:
   - **Show zoom controls** - Display pan/zoom controls (zoom disabled, only pan works)
   - **Show minimap** - Display the minimap overview
   - **Show background** - Display the grid/dot background
4. Adjust iframe dimensions (width and height)
5. Click **Copy Embed Code** to copy the iframe HTML

### 3. Embed in Your Website

Paste the copied code into your HTML:

```html
<iframe
  src="https://your-domain.com/embed/flow-id-123?background=true"
  width="100%"
  height="600"
  frameborder="0"
  style="border: none;"
></iframe>
```

## URL Parameters

The embed URL supports the following query parameters:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `controls` | boolean | `false` | Show zoom/pan control buttons |
| `minimap` | boolean | `false` | Show minimap overview |
| `background` | boolean | `true` | Show grid/dot background |
| `fitView` | boolean | `true` | Auto-fit content to view. When `false`, uses saved viewport position and zoom |

### Example URLs

**Minimal embed (no controls, no minimap):**
```
/embed/abc123
```

**With controls and minimap:**
```
/embed/abc123?controls=true&minimap=true
```

**Without background:**
```
/embed/abc123?background=false
```

**Use saved viewport (no auto-fit):**
```
/embed/abc123?fitView=false
```
This will display the diagram at the exact zoom level and position that was saved in the editor.

## Component Architecture

### FlowViewer Component

Located at: `src/components/FlowViewer.tsx`

A reusable, read-only flow diagram viewer with the following configuration:

```tsx
<FlowViewer
  flowData={{
    nodes: Node[],
    edges: Edge[],
    viewport: { x, y, zoom },
    canvasSettings: { showDots, backgroundColor, dotColor }
  }}
  config={{
    showControls: boolean,
    showMiniMap: boolean,
    showBackground: boolean
  }}
/>
```

**Key Props:**
- `nodesDraggable={false}` - Prevents node dragging
- `nodesConnectable={false}` - Prevents creating connections
- `elementsSelectable={false}` - Prevents selection
- `zoomOnScroll={false}` - Disables scroll zoom
- `zoomOnPinch={false}` - Disables pinch zoom
- `zoomOnDoubleClick={false}` - Disables double-click zoom
- `panOnDrag={true}` - Enables panning

### Embed Route

Located at: `src/routes/embed/$flowId.tsx`

Renders the FlowViewer component in a full-screen layout without the application header/footer.

**Features:**
- Loads flow data via `flowsApi.get(flowId)`
- Parses URL query parameters for configuration
- Shows loading state while fetching data
- Shows error state if flow not found
- Full-screen viewport optimized for iframes

### Embed Generator Dialog

Located at: `src/components/FlowEmbedGenerator.tsx`

Interactive dialog for generating embed code with:
- Dimension configuration (width, height)
- Display options (controls, minimap, background)
- Live preview of the embedded diagram
- Copy-to-clipboard functionality
- Direct URL and iframe code generation

## User Interactions

### Allowed Interactions

✅ **Pan** - Click and drag the canvas to pan
✅ **Hover** - Hover over nodes to see hover cards
✅ **View** - See all nodes, edges, and content

### Disabled Interactions

❌ **Zoom** - Mouse wheel, pinch, and double-click zoom disabled
❌ **Drag Nodes** - Cannot move nodes
❌ **Edit** - Cannot edit node content or properties
❌ **Connect** - Cannot create or modify edges
❌ **Select** - Cannot select nodes or edges
❌ **Delete** - Cannot delete elements

## Testing

A test HTML file is provided at `test-embed.html` in the project root.

### How to Test

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open Flow Builder at `http://localhost:3000`

3. Create and save a flow diagram

4. Click "Share/Embed" and copy the embed code

5. Open `test-embed.html` in a browser

6. Replace the iframe `src` with your embed URL

7. Verify:
   - ✅ Diagram displays correctly
   - ✅ Pan works (click and drag)
   - ✅ Zoom is disabled
   - ✅ Hover cards appear
   - ✅ No editing capabilities

## Styling and Customization

### Iframe Styling

You can customize the iframe appearance using CSS:

```html
<iframe
  src="/embed/abc123"
  width="100%"
  height="600"
  frameborder="0"
  style="
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  "
></iframe>
```

### Responsive Sizing

For responsive embeds, use percentage widths:

```html
<div style="width: 100%; max-width: 1200px; margin: 0 auto;">
  <iframe
    src="/embed/abc123"
    width="100%"
    height="600"
    frameborder="0"
  ></iframe>
</div>
```

### Aspect Ratio

Maintain aspect ratio with CSS:

```css
.embed-container {
  position: relative;
  width: 100%;
  padding-bottom: 56.25%; /* 16:9 aspect ratio */
}

.embed-container iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: none;
}
```

```html
<div class="embed-container">
  <iframe src="/embed/abc123"></iframe>
</div>
```

## Security Considerations

### Current Implementation

- ✅ Read-only access (no mutations possible)
- ✅ XSS protection via React's built-in escaping
- ✅ Iframe sandbox compatible
- ✅ No authentication required for viewing

### Future Enhancements

Consider implementing for production:

1. **Access Control** - Token-based authentication for private flows
2. **Rate Limiting** - Prevent abuse of embed endpoints
3. **Domain Whitelisting** - Restrict which domains can embed
4. **Content Security Policy** - Add CSP headers
5. **CORS Configuration** - Proper CORS headers for API calls

## Troubleshooting

### Embed Not Loading

**Problem:** Iframe shows blank or loading indefinitely
**Solution:**
- Check that the flow ID is correct
- Verify the flow exists and is saved
- Check browser console for errors
- Ensure development server is running

### Hover Cards Not Appearing

**Problem:** Node hover cards don't show up
**Solution:**
- Ensure nodes have content configured in the builder
- Check that hover content is not empty
- Verify popover component is rendering correctly

### Zoom Controls Don't Work

**Problem:** Zoom controls are visible but don't zoom
**Solution:**
- This is expected behavior - zoom is intentionally disabled
- Only pan functionality works in embedded views
- Controls can be hidden with `?controls=false`

### Styling Issues

**Problem:** Iframe content doesn't match expected styles
**Solution:**
- Check that Tailwind CSS is loading correctly
- Verify all node type styles are defined
- Ensure canvas settings are saved with the flow

## API Reference

### FlowViewer Props

```typescript
interface FlowViewerProps {
  flowData: {
    nodes: Node[];
    edges: Edge[];
    viewport?: {
      x: number;
      y: number;
      zoom: number;
    };
    canvasSettings?: {
      showDots?: boolean;
      backgroundColor?: string;
      dotColor?: string;
    };
  };
  config?: {
    showControls?: boolean;
    showMiniMap?: boolean;
    showBackground?: boolean;
  };
  onInit?: (instance: ReactFlowInstance) => void;
}
```

### Embed URL Format

```
/embed/{flowId}?controls={boolean}&minimap={boolean}&background={boolean}
```

## Examples

### Basic Embed

```html
<iframe
  src="http://localhost:3000/embed/my-flow-id"
  width="800"
  height="600"
  frameborder="0"
></iframe>
```

### Full-Featured Embed

```html
<iframe
  src="http://localhost:3000/embed/my-flow-id?controls=true&minimap=true"
  width="100%"
  height="800"
  frameborder="0"
  style="border: 1px solid #ddd; border-radius: 4px;"
></iframe>
```

### Minimal Embed (No Background)

```html
<iframe
  src="http://localhost:3000/embed/my-flow-id?background=false"
  width="600"
  height="400"
  frameborder="0"
></iframe>
```

## Future Enhancements

Potential features for future versions:

- 🔲 Public/private flow sharing controls
- 🔲 Expiring embed links
- 🔲 Analytics (view counts, interaction tracking)
- 🔲 Custom branding options
- 🔲 Export to image (PNG/SVG) from embed
- 🔲 Embed code with JavaScript SDK option
- 🔲 Webhook notifications on embed views
- 🔲 A/B testing different embed configurations

## Support

For issues or questions:
- Check the troubleshooting section above
- Review the architecture documentation at `docs/EMBEDDABLE_ARCHITECTURE.txt`
- Inspect browser console for errors
- Verify all dependencies are installed: `npm install`
