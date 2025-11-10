import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { toast } from 'sonner';
import { Copy, Check, Code2 } from 'lucide-react';
import { FlowViewer } from './FlowViewer';
import type { ReactFlowInstance } from '@xyflow/react';

interface FlowEmbedGeneratorProps {
  flowId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FlowEmbedGenerator({ flowId, open, onOpenChange }: FlowEmbedGeneratorProps) {
  const [width, setWidth] = useState('100%');
  const [height, setHeight] = useState('600');
  const [showControls, setShowControls] = useState(false);
  const [showMinimap, setShowMinimap] = useState(false);
  const [showBackground, setShowBackground] = useState(true);
  const [fitView, setFitView] = useState(false);
  const [copied, setCopied] = useState(false);
  const [flowData, setFlowData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [viewport, setViewport] = useState<{ x: number; y: number; zoom: number } | null>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);

  // Load flow data when dialog opens
  useEffect(() => {
    if (open && flowId) {
      async function loadFlow() {
        try {
          setLoading(true);
          const response = await fetch(`/api/embed/${flowId}`);
          if (!response.ok) {
            throw new Error('Failed to load flow');
          }
          const data = await response.json() as { flow: any; flowData: any };
          setFlowData(data.flowData);
          // Initialize viewport from flow data
          if (data.flowData?.viewport) {
            setViewport(data.flowData.viewport);
          }
        } catch (err) {
          toast.error('Failed to load flow for preview');
        } finally {
          setLoading(false);
        }
      }
      loadFlow();
    }
  }, [open, flowId]);

  // Capture viewport changes from the preview
  const handleInit = (instance: ReactFlowInstance) => {
    setReactFlowInstance(instance);
    // Set initial viewport
    const vp = instance.getViewport();
    setViewport(vp);
  };

  // Handler for viewport changes
  const handleViewportChange = () => {
    if (reactFlowInstance) {
      const vp = reactFlowInstance.getViewport();
      setViewport(vp);
    }
  };

  const generateEmbedUrl = () => {
    const baseUrl = window.location.origin;
    const params = new URLSearchParams();

    if (showControls) params.append('controls', 'true');
    if (showMinimap) params.append('minimap', 'true');
    if (!showBackground) params.append('background', 'false');
    if (!fitView && viewport) {
      params.append('fitView', 'false');
      params.append('x', viewport.x.toString());
      params.append('y', viewport.y.toString());
      params.append('zoom', viewport.zoom.toString());
    }

    const queryString = params.toString();
    return `${baseUrl}/embed/${flowId}${queryString ? `?${queryString}` : ''}`;
  };

  const generateIframeCode = () => {
    const url = generateEmbedUrl();
    return `<iframe
  src="${url}"
  width="${width}"
  height="${height}"
  frameborder="0"
  style="border: none;"
></iframe>`;
  };

  const handleCopy = async () => {
    const code = generateIframeCode();
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success('Embed code copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const handleCopyUrl = async () => {
    const url = generateEmbedUrl();
    try {
      await navigator.clipboard.writeText(url);
      toast.success('URL copied to clipboard');
    } catch (err) {
      toast.error('Failed to copy to clipboard');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Code2 className="h-5 w-5" />
            Embed Flow Diagram
          </DialogTitle>
          <DialogDescription>
            Generate an embed code to display this flow diagram on your website. Adjust the preview viewport by panning and zooming to set the initial view.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Dimensions */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Iframe Dimensions</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="width">Width</Label>
                <Input
                  id="width"
                  value={width}
                  onChange={(e) => setWidth(e.target.value)}
                  placeholder="e.g., 100%, 800px"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="height">Height (px)</Label>
                <Input
                  id="height"
                  type="text"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="e.g., 600"
                />
              </div>
            </div>
          </div>

          {/* Options */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Display Options</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="controls"
                  className="text-sm font-normal cursor-pointer"
                >
                  Show zoom controls (Note: zoom is disabled, only pan is allowed)
                </Label>
                <Switch
                  id="controls"
                  checked={showControls}
                  onCheckedChange={setShowControls}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="minimap"
                  className="text-sm font-normal cursor-pointer"
                >
                  Show minimap
                </Label>
                <Switch
                  id="minimap"
                  checked={showMinimap}
                  onCheckedChange={setShowMinimap}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="background"
                  className="text-sm font-normal cursor-pointer"
                >
                  Show background
                </Label>
                <Switch
                  id="background"
                  checked={showBackground}
                  onCheckedChange={setShowBackground}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="fitView"
                  className="text-sm font-normal cursor-pointer"
                >
                  Auto-fit content to view
                </Label>
                <Switch
                  id="fitView"
                  checked={fitView}
                  onCheckedChange={setFitView}
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {fitView
                ? 'Auto-fit is enabled. The diagram will automatically fit to the viewport.'
                : 'Auto-fit is disabled. Pan and zoom the preview below to set the initial viewport position.'}
            </p>
          </div>

          {/* Interactive Preview */}
          <div className="space-y-2">
            <Label>Interactive Preview</Label>
            <div
              className="border rounded-lg overflow-hidden bg-muted/30"
              style={{ height: `${parseInt(height) || 600}px` }}
            >
              {loading ? (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : flowData ? (
                <FlowViewer
                  flowData={{
                    ...flowData,
                    viewport: viewport || flowData.viewport
                  }}
                  config={{
                    showControls: true,
                    showMiniMap: showMinimap,
                    showBackground: showBackground,
                    fitView: fitView,
                    interactive: true, // Enable zoom in preview
                  }}
                  onInit={handleInit}
                  onMove={handleViewportChange}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  Failed to load preview
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {fitView
                ? 'Preview shows auto-fit behavior (content will be automatically centered).'
                : 'Pan and zoom to adjust the viewport. The embed will use this exact view.'}
            </p>
          </div>

          {/* Viewport Info */}
          {!fitView && viewport && (
            <div className="text-xs text-muted-foreground bg-muted p-3 rounded-lg">
              <strong>Current Viewport:</strong> x: {viewport.x.toFixed(2)}, y: {viewport.y.toFixed(2)}, zoom: {viewport.zoom.toFixed(2)}
            </div>
          )}

          {/* Embed URL */}
          <div className="space-y-2">
            <Label>Direct URL</Label>
            <div className="flex gap-2">
              <Input
                value={generateEmbedUrl()}
                readOnly
                className="font-mono text-xs"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyUrl}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Generated Code */}
          <div className="space-y-2">
            <Label>Embed Code</Label>
            <div className="relative">
              <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
                <code>{generateIframeCode()}</code>
              </pre>
              <Button
                variant="outline"
                size="sm"
                className="absolute top-2 right-2"
                onClick={handleCopy}
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-1" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-1" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Button onClick={handleCopy}>
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Embed Code
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
