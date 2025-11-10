import { useState, useEffect } from 'react';
import type { Edge } from '@xyflow/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Slider } from './ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Switch } from './ui/switch';

export interface EdgeStyleData {
  stroke?: string;
  strokeWidth?: number;
  animated?: boolean;
  type?: 'default' | 'straight' | 'step' | 'smoothstep';
  style?: {
    strokeDasharray?: string;
    animation?: string;
  };
  animationDirection?: 'forward' | 'backward';
  animationSpeed?: number;
}

interface EdgeEditDialogProps {
  open: boolean;
  edge: Edge | null;
  onClose: () => void;
  onUpdateEdge: (edgeId: string, data: EdgeStyleData) => void;
  onDeleteEdge: (edgeId: string) => void;
}

export function EdgeEditDialog({
  open,
  edge,
  onClose,
  onUpdateEdge,
  onDeleteEdge,
}: EdgeEditDialogProps) {
  const [formData, setFormData] = useState<EdgeStyleData>({
    stroke: '#b1b1b7',
    strokeWidth: 2,
    animated: false,
    type: 'default',
    style: {},
    animationDirection: 'forward',
    animationSpeed: 1,
  });

  const [lineStyle, setLineStyle] = useState<'solid' | 'dashed' | 'dotted'>('solid');

  // Update form data when edge changes
  useEffect(() => {
    if (edge) {
      const currentStroke = edge.style?.stroke || '#b1b1b7';
      const currentStrokeWidth = edge.style?.strokeWidth || 2;
      const currentType = edge.type || 'default';
      const currentStrokeDasharray = edge.style?.strokeDasharray;
      const currentAnimation = edge.style?.animation;
      const currentAnimationDirection = (edge.data?.animationDirection as 'forward' | 'backward') || 'forward';
      const currentAnimationSpeed = (edge.data?.animationSpeed as number) || 1;

      // Determine line style from strokeDasharray
      let detectedLineStyle: 'solid' | 'dashed' | 'dotted' = 'solid';
      if (currentStrokeDasharray === '5 5') {
        detectedLineStyle = 'dashed';
      } else if (currentStrokeDasharray === '1 5') {
        detectedLineStyle = 'dotted';
      }

      // Determine if animated - either from edge.animated (solid) or from animation CSS property (dashed/dotted)
      const isAnimated = edge.animated || (currentAnimation && currentAnimation.includes('dashdraw'));

      setLineStyle(detectedLineStyle);
      setFormData({
        stroke: currentStroke as string,
        strokeWidth: currentStrokeWidth as number,
        animated: isAnimated || false,
        type: currentType as any,
        style: edge.style || {},
        animationDirection: currentAnimationDirection,
        animationSpeed: currentAnimationSpeed,
      });
    }
  }, [edge, open]);

  const handleSave = () => {
    if (edge) {
      // Build strokeDasharray based on line style
      let strokeDasharray: string | undefined = undefined;
      if (lineStyle === 'dashed') {
        strokeDasharray = '5 5';
      } else if (lineStyle === 'dotted') {
        strokeDasharray = '1 5';
      }

      // Build animation if animated
      let animation: string | undefined = undefined;
      if (formData.animated && (lineStyle === 'dashed' || lineStyle === 'dotted')) {
        const duration = 1 / (formData.animationSpeed || 1);
        if (formData.animationDirection === 'forward') {
          animation = `dashdraw ${duration}s linear infinite`;
        } else {
          animation = `dashdraw-reverse ${duration}s linear infinite`;
        }
      }

      onUpdateEdge(edge.id, {
        stroke: formData.stroke,
        strokeWidth: formData.strokeWidth,
        animated: formData.animated && lineStyle === 'solid',
        type: formData.type,
        style: {
          strokeDasharray,
          animation,
        },
        animationDirection: formData.animationDirection,
        animationSpeed: formData.animationSpeed,
      });
    }
    onClose();
  };

  const handleDelete = () => {
    if (edge) {
      onDeleteEdge(edge.id);
    }
    onClose();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Edge Properties</DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="appearance" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="appearance">Appearance</TabsTrigger>
              <TabsTrigger value="animation">Animation</TabsTrigger>
            </TabsList>

            {/* Appearance Tab */}
            <TabsContent value="appearance" className="space-y-4 mt-0">
              <div className="space-y-2">
                <Label htmlFor="edgeColor">Edge Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="edgeColor"
                    type="color"
                    value={formData.stroke}
                    onChange={(e) => setFormData({ ...formData, stroke: e.target.value })}
                    className="w-16 h-10"
                  />
                  <Input
                    type="text"
                    value={formData.stroke}
                    onChange={(e) => setFormData({ ...formData, stroke: e.target.value })}
                    placeholder="#b1b1b7"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="strokeWidth">
                  Line Width: {formData.strokeWidth}px
                </Label>
                <Slider
                  id="strokeWidth"
                  min={1}
                  max={10}
                  step={1}
                  value={[formData.strokeWidth ?? 2]}
                  onValueChange={(value) => setFormData({ ...formData, strokeWidth: value[0] })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lineStyle">Line Style</Label>
                <Select
                  value={lineStyle}
                  onValueChange={(value) => setLineStyle(value as 'solid' | 'dashed' | 'dotted')}
                >
                  <SelectTrigger id="lineStyle">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="solid">Solid</SelectItem>
                    <SelectItem value="dashed">Dashed</SelectItem>
                    <SelectItem value="dotted">Dotted</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edgeType">Edge Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value as any })}
                >
                  <SelectTrigger id="edgeType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default (Bezier)</SelectItem>
                    <SelectItem value="straight">Straight</SelectItem>
                    <SelectItem value="step">Step</SelectItem>
                    <SelectItem value="smoothstep">Smooth Step</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            {/* Animation Tab */}
            <TabsContent value="animation" className="space-y-4 mt-0">
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="animated" className="text-base">Enable Animation</Label>
                <Switch
                  id="animated"
                  checked={formData.animated}
                  onCheckedChange={(checked) => setFormData({ ...formData, animated: checked })}
                />
              </div>

              {formData.animated && (
                <>
                  {lineStyle !== 'solid' && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="animationDirection">Animation Direction</Label>
                        <Select
                          value={formData.animationDirection}
                          onValueChange={(value) => setFormData({ ...formData, animationDirection: value as 'forward' | 'backward' })}
                        >
                          <SelectTrigger id="animationDirection">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="forward">Forward</SelectItem>
                            <SelectItem value="backward">Backward</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="animationSpeed">
                          Animation Speed: {formData.animationSpeed}x
                        </Label>
                        <Slider
                          id="animationSpeed"
                          min={0.5}
                          max={3}
                          step={0.5}
                          value={[formData.animationSpeed ?? 1]}
                          onValueChange={(value) => setFormData({ ...formData, animationSpeed: value[0] })}
                        />
                      </div>
                    </>
                  )}

                  {lineStyle === 'solid' && (
                    <div className="text-sm text-muted-foreground p-4 bg-muted rounded-md">
                      Solid lines use React Flow's built-in animation (moving dots). For dashed/dotted lines, you can control animation direction and speed.
                    </div>
                  )}
                </>
              )}
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="destructive" onClick={handleDelete}>
              Delete Edge
            </Button>
            <div className="flex-1" />
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
