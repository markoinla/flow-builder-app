import { useState, useRef, type PointerEvent } from 'react';
import { useReactFlow, type XYPosition } from '@xyflow/react';

function getPosition(start: XYPosition, end: XYPosition) {
  return {
    x: Math.min(start.x, end.x),
    y: Math.min(start.y, end.y),
  };
}

function getDimensions(start: XYPosition, end: XYPosition) {
  return {
    width: Math.abs(end.x - start.x),
    height: Math.abs(end.y - start.y),
  };
}

const colors = [
  '#D14D41',
  '#DA702C',
  '#D0A215',
  '#879A39',
  '#3AA99F',
  '#4385BE',
  '#8B7EC8',
  '#CE5D97',
];

function getRandomColor(): string {
  return colors[Math.floor(Math.random() * colors.length)];
}

interface RectangleToolProps {
  onComplete?: () => void;
}

export function RectangleTool({ onComplete }: RectangleToolProps) {
  const [start, setStart] = useState<XYPosition | null>(null);
  const [end, setEnd] = useState<XYPosition | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const { screenToFlowPosition, getViewport, setNodes } = useReactFlow();

  function handlePointerDown(e: PointerEvent) {
    const rect = overlayRef.current?.getBoundingClientRect();
    if (!rect) return;

    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setStart({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  }

  function handlePointerMove(e: PointerEvent) {
    if (e.buttons !== 1) return;
    const rect = overlayRef.current?.getBoundingClientRect();
    if (!rect) return;

    setEnd({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  }

  function handlePointerUp() {
    if (!start || !end) return;
    const rect = overlayRef.current?.getBoundingClientRect();
    if (!rect) return;

    // Convert overlay-relative coordinates to screen coordinates for ReactFlow
    const startScreen = {
      x: start.x + rect.left,
      y: start.y + rect.top
    };
    const endScreen = {
      x: end.x + rect.left,
      y: end.y + rect.top
    };

    const position = screenToFlowPosition(getPosition(startScreen, endScreen));
    const dimension = getDimensions(startScreen, endScreen);
    const zoom = getViewport().zoom;

    setNodes((nodes) => [
      ...nodes,
      {
        id: crypto.randomUUID(),
        type: 'rectangle',
        position,
        width: dimension.width / zoom,
        height: dimension.height / zoom,
        data: {
          color: getRandomColor(),
          opacity: 60,
          borderColor: '#e5e5e5',
          borderStyle: 'solid' as const,
          borderWidth: 1,
          borderRadius: 6,
          cornerDecoration: 'none' as const,
          cornerDecorationSize: 8,
        },
        zIndex: -1, // Always render behind nodes and edges
      },
    ]);

    setStart(null);
    setEnd(null);

    // Switch back to selection mode
    onComplete?.();
  }

  const rect =
    start && end
      ? {
          position: getPosition(start, end),
          dimension: getDimensions(start, end),
        }
      : null;

  return (
    <div
      ref={overlayRef}
      className="nopan nodrag tool-overlay"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 10,
        cursor: 'crosshair',
      }}
    >
      {rect && (
        <div
          className="rectangle-preview"
          style={{
            position: 'absolute',
            ...rect.dimension,
            transform: `translate(${rect.position.x}px, ${rect.position.y}px)`,
            border: '2px dashed rgba(0, 89, 220, 0.8)',
            pointerEvents: 'none',
          }}
        ></div>
      )}
    </div>
  );
}
