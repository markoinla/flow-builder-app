import { useState, useEffect } from 'react';
import type { Node } from '@xyflow/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Slider } from './ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Copy } from 'lucide-react';
import type { RectangleNodeData } from './RectangleNode';

interface RectangleEditDialogProps {
  open: boolean;
  node: Node | null;
  onClose: () => void;
  onUpdateNode: (nodeId: string, data: RectangleNodeData) => void;
  onDeleteNode: (nodeId: string) => void;
  onDuplicateNode?: (nodeId: string) => void;
}

export function RectangleEditDialog({
  open,
  node,
  onClose,
  onUpdateNode,
  onDeleteNode,
  onDuplicateNode,
}: RectangleEditDialogProps) {
  const [formData, setFormData] = useState<RectangleNodeData>({
    color: '#f5efe9',
    opacity: 60,
    borderColor: '#e5e5e5',
    borderStyle: 'solid',
    borderWidth: 1,
    borderRadius: 6,
    cornerDecoration: 'none',
    cornerDecorationSize: 8,
  });

  // Update form data when node changes
  useEffect(() => {
    if (node && node.type === 'rectangle') {
      const data = node.data as RectangleNodeData;
      setFormData({
        color: data.color || '#f5efe9',
        opacity: data.opacity ?? 60,
        borderColor: data.borderColor || '#e5e5e5',
        borderStyle: data.borderStyle || 'solid',
        borderWidth: data.borderWidth ?? 1,
        borderRadius: data.borderRadius ?? 6,
        cornerDecoration: data.cornerDecoration || 'none',
        cornerDecorationSize: data.cornerDecorationSize ?? 8,
      });
    }
  }, [node]);

  const handleSave = () => {
    if (node) {
      onUpdateNode(node.id, formData);
    }
    onClose();
  };

  const handleDelete = () => {
    if (node) {
      onDeleteNode(node.id);
    }
    onClose();
  };

  const handleDuplicate = () => {
    if (node && onDuplicateNode) {
      onDuplicateNode(node.id);
    }
    onClose();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Rectangle Properties</DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="appearance" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="appearance">Appearance</TabsTrigger>
              <TabsTrigger value="border">Border</TabsTrigger>
            </TabsList>

            {/* Appearance Tab */}
            <TabsContent value="appearance" className="space-y-4 mt-0">
              <div className="space-y-2">
                <Label htmlFor="color">Background Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="color"
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-16 h-10"
                  />
                  <Input
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    placeholder="#f5efe9"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="opacity">
                  Opacity: {formData.opacity}%
                </Label>
                <Slider
                  id="opacity"
                  min={0}
                  max={100}
                  step={5}
                  value={[formData.opacity ?? 60]}
                  onValueChange={(value) => setFormData({ ...formData, opacity: value[0] })}
                />
              </div>
            </TabsContent>

            {/* Border Tab */}
            <TabsContent value="border" className="space-y-4 mt-0">
              <div className="space-y-2">
                <Label htmlFor="borderColor">Border Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="borderColor"
                    type="color"
                    value={formData.borderColor || '#e5e5e5'}
                    onChange={(e) => setFormData({ ...formData, borderColor: e.target.value })}
                    className="w-16 h-10"
                  />
                  <Input
                    type="text"
                    value={formData.borderColor}
                    onChange={(e) => setFormData({ ...formData, borderColor: e.target.value })}
                    placeholder="#e5e5e5"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="borderStyle">Border Style</Label>
                <Select
                  value={formData.borderStyle}
                  onValueChange={(value) => setFormData({ ...formData, borderStyle: value as 'solid' | 'dashed' | 'dotted' })}
                >
                  <SelectTrigger id="borderStyle">
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
                <Label htmlFor="borderWidth">
                  Border Width: {formData.borderWidth}px
                </Label>
                <Slider
                  id="borderWidth"
                  min={0}
                  max={10}
                  step={1}
                  value={[formData.borderWidth ?? 1]}
                  onValueChange={(value) => setFormData({ ...formData, borderWidth: value[0] })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="borderRadius">Corner Radius</Label>
                <Select
                  value={String(formData.borderRadius ?? 6)}
                  onValueChange={(value) => setFormData({ ...formData, borderRadius: parseInt(value) })}
                >
                  <SelectTrigger id="borderRadius">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Square (0px)</SelectItem>
                    <SelectItem value="3">Slightly Rounded (3px)</SelectItem>
                    <SelectItem value="6">Rounded (6px)</SelectItem>
                    <SelectItem value="8">Rounded (8px)</SelectItem>
                    <SelectItem value="16">Very Rounded (16px)</SelectItem>
                    <SelectItem value="9999">Circle/Pill (9999px)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cornerDecoration">Corner Decoration</Label>
                <Select
                  value={formData.cornerDecoration || 'none'}
                  onValueChange={(value) => setFormData({ ...formData, cornerDecoration: value as 'none' | 'square' | 'circle' | 'square-outline' | 'circle-outline' })}
                >
                  <SelectTrigger id="cornerDecoration">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="square">Square (Filled)</SelectItem>
                    <SelectItem value="circle">Circle (Filled)</SelectItem>
                    <SelectItem value="square-outline">Square (Outline)</SelectItem>
                    <SelectItem value="circle-outline">Circle (Outline)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.cornerDecoration && formData.cornerDecoration !== 'none' && (
                <div className="space-y-2">
                  <Label htmlFor="cornerDecorationSize">
                    Corner Decoration Size: {formData.cornerDecorationSize}px
                  </Label>
                  <Slider
                    id="cornerDecorationSize"
                    min={4}
                    max={16}
                    step={2}
                    value={[formData.cornerDecorationSize ?? 8]}
                    onValueChange={(value) => setFormData({ ...formData, cornerDecorationSize: value[0] })}
                  />
                </div>
              )}
            </TabsContent>
          </Tabs>

          <DialogFooter className="flex justify-between items-center">
            <div className="flex gap-2">
              <Button variant="destructive" onClick={handleDelete}>
                Delete Rectangle
              </Button>
              {onDuplicateNode && (
                <Button variant="outline" size="icon" onClick={handleDuplicate} title="Duplicate">
                  <Copy className="h-4 w-4" />
                </Button>
              )}
            </div>
            <div className="flex gap-2 ml-auto">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                Save Changes
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
