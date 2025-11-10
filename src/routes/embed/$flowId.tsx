import { createFileRoute } from '@tanstack/react-router';
import { FlowViewer } from '../../components/FlowViewer';
import { z } from 'zod';
import { useState, useEffect } from 'react';

const embedSearchSchema = z.object({
  controls: z.boolean().optional().default(false),
  minimap: z.boolean().optional().default(false),
  background: z.boolean().optional().default(true),
  fitView: z.boolean().optional().default(true),
  x: z.number().optional(),
  y: z.number().optional(),
  zoom: z.number().optional(),
});

export const Route = createFileRoute('/embed/$flowId')({
  component: EmbedPage,
  validateSearch: embedSearchSchema,
});

function EmbedPage() {
  const { flowId } = Route.useParams();
  const searchParams = Route.useSearch();
  const [flowData, setFlowData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadFlow() {
      try {
        setLoading(true);
        // Use public embed API endpoint (no auth required)
        const response = await fetch(`/api/embed/${flowId}`);
        if (!response.ok) {
          throw new Error('Flow not found');
        }
        const data = await response.json() as { flow: any; flowData: any };
        setFlowData(data.flowData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load flow');
      } finally {
        setLoading(false);
      }
    }

    loadFlow();
  }, [flowId]);

  if (loading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading flow diagram...</p>
        </div>
      </div>
    );
  }

  if (error || !flowData) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md p-6">
          <div className="text-destructive mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold mb-2">Flow Not Found</h1>
          <p className="text-muted-foreground">
            {error || 'The requested flow diagram could not be loaded.'}
          </p>
        </div>
      </div>
    );
  }

  // Override viewport if provided in URL params
  const dataWithViewport = {
    ...flowData,
    viewport: (searchParams.x !== undefined && searchParams.y !== undefined && searchParams.zoom !== undefined)
      ? { x: searchParams.x, y: searchParams.y, zoom: searchParams.zoom }
      : flowData.viewport
  };

  return (
    <div className="w-screen h-screen">
      <FlowViewer
        flowData={dataWithViewport}
        config={{
          showControls: searchParams.controls ?? false,
          showMiniMap: searchParams.minimap ?? false,
          showBackground: searchParams.background ?? true,
          fitView: searchParams.fitView ?? true,
        }}
      />
    </div>
  );
}
