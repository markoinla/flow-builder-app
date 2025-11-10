import { useState, useEffect } from 'react';
import type { CustomNodeType, HandleConfig } from '../types/node-types';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Slider } from './ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Switch } from './ui/switch';
import { IconPicker, type IconName } from './ui/icon-picker';
import { HandlePositionSelector } from './HandlePositionSelector';

interface NodeTypeEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingId: string | null;
  initialData: NodeTypeFormData;
  onSave: (nodeType: CustomNodeType) => void;
}

export interface NodeTypeFormData {
  name: string;
  nodeTypeCategory: 'standard' | 'icon';
  // Standard node fields
  backgroundColor: string;
  backgroundOpacity: number;
  borderColor: string;
  borderStyle: 'solid' | 'dashed' | 'dotted';
  borderWidth: number;
  textColor: string;
  borderRadius: number;
  // Icon node fields
  iconName: IconName;
  iconSize: number;
  iconColor: string;
  iconBackgroundColor: string;
  iconBackgroundOpacity: number;
  showLabel: boolean;
  labelPosition: 'top' | 'bottom';
  labelColor: string;
  iconBorderColor: string;
  iconBorderStyle: 'solid' | 'dashed' | 'dotted';
  iconBorderWidth: number;
  iconBorderRadius: number;
  // Handle configuration
  handles: HandleConfig;
}

export function NodeTypeEditor({
  open,
  onOpenChange,
  editingId,
  initialData,
  onSave,
}: NodeTypeEditorProps) {
  const [formData, setFormData] = useState<NodeTypeFormData>(initialData);

  // Update form data when initialData changes (e.g., when editing a different node type)
  useEffect(() => {
    setFormData(initialData);
  }, [initialData, open]);

  const handleSave = () => {
    let nodeType: CustomNodeType;

    if (formData.nodeTypeCategory === 'icon') {
      nodeType = {
        id: editingId || `icon_${Date.now()}`,
        name: formData.name,
        type: 'icon',
        iconStyle: {
          iconName: formData.iconName,
          iconSize: formData.iconSize,
          iconColor: formData.iconColor,
          backgroundColor: formData.iconBackgroundColor || undefined,
          backgroundOpacity: formData.iconBackgroundOpacity,
          showLabel: formData.showLabel,
          labelPosition: formData.labelPosition,
          labelColor: formData.labelColor,
          borderColor: formData.iconBorderColor,
          borderStyle: formData.iconBorderStyle,
          borderWidth: formData.iconBorderWidth,
          borderRadius: formData.iconBorderRadius,
        },
        handles: formData.handles,
      };
    } else {
      nodeType = {
        id: editingId || `custom_${Date.now()}`,
        name: formData.name,
        type: 'standard',
        style: {
          backgroundColor: formData.backgroundColor,
          backgroundOpacity: formData.backgroundOpacity,
          borderColor: formData.borderColor,
          borderStyle: formData.borderStyle,
          borderWidth: formData.borderWidth,
          textColor: formData.textColor,
          borderRadius: formData.borderRadius,
        },
        handles: formData.handles,
      };
    }

    onSave(nodeType);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {editingId ? 'Edit Node Type' : 'Create Node Type'}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="details" className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="border">Border</TabsTrigger>
            <TabsTrigger value="connections">Connections</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto py-4">
            {/* Details Tab */}
            <TabsContent value="details" className="space-y-4 mt-0">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter node type name"
                />
              </div>

              {!editingId && (
                <div className="space-y-2">
                  <Label htmlFor="nodeTypeCategory">Node Category</Label>
                  <Select
                    value={formData.nodeTypeCategory}
                    onValueChange={(value) => setFormData({ ...formData, nodeTypeCategory: value as 'standard' | 'icon' })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard Node</SelectItem>
                      <SelectItem value="icon">Icon Node</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {formData.nodeTypeCategory === 'icon' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="iconPicker">Icon</Label>
                    <IconPicker
                      value={formData.iconName}
                      onValueChange={(iconName) => setFormData({ ...formData, iconName })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="iconSize">
                      Icon Size: {formData.iconSize}px
                    </Label>
                    <Slider
                      id="iconSize"
                      min={16}
                      max={64}
                      step={2}
                      value={[formData.iconSize]}
                      onValueChange={(value) => setFormData({ ...formData, iconSize: value[0] })}
                    />
                  </div>

                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="showLabel" className="text-base">Show Label</Label>
                    <Switch
                      id="showLabel"
                      checked={formData.showLabel}
                      onCheckedChange={(checked) => setFormData({ ...formData, showLabel: checked })}
                    />
                  </div>

                  {formData.showLabel && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="labelPosition">Label Position</Label>
                        <Select
                          value={formData.labelPosition}
                          onValueChange={(value) => setFormData({ ...formData, labelPosition: value as 'top' | 'bottom' })}
                        >
                          <SelectTrigger id="labelPosition">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="top">Top</SelectItem>
                            <SelectItem value="bottom">Bottom</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="labelColor">Label Color</Label>
                        <div className="flex gap-2">
                          <Input
                            id="labelColor"
                            type="color"
                            value={formData.labelColor}
                            onChange={(e) => setFormData({ ...formData, labelColor: e.target.value })}
                            className="w-16 h-10"
                          />
                          <Input
                            type="text"
                            value={formData.labelColor}
                            onChange={(e) => setFormData({ ...formData, labelColor: e.target.value })}
                            placeholder="#000000"
                          />
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}
            </TabsContent>

            {/* Appearance Tab */}
            <TabsContent value="appearance" className="space-y-4 mt-0">
              {formData.nodeTypeCategory === 'standard' ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="backgroundColor">Background Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="backgroundColor"
                        type="color"
                        value={formData.backgroundColor}
                        onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                        className="w-16 h-10"
                      />
                      <Input
                        type="text"
                        value={formData.backgroundColor}
                        onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                        placeholder="#ffffff"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="backgroundOpacity">
                      Background Opacity: {formData.backgroundOpacity}%
                    </Label>
                    <Slider
                      id="backgroundOpacity"
                      min={0}
                      max={100}
                      step={5}
                      value={[formData.backgroundOpacity]}
                      onValueChange={(value) => setFormData({ ...formData, backgroundOpacity: value[0] })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="textColor">Text Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="textColor"
                        type="color"
                        value={formData.textColor}
                        onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
                        className="w-16 h-10"
                      />
                      <Input
                        type="text"
                        value={formData.textColor}
                        onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
                        placeholder="#000000"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="iconColor">Icon Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="iconColor"
                        type="color"
                        value={formData.iconColor}
                        onChange={(e) => setFormData({ ...formData, iconColor: e.target.value })}
                        className="w-16 h-10"
                      />
                      <Input
                        type="text"
                        value={formData.iconColor}
                        onChange={(e) => setFormData({ ...formData, iconColor: e.target.value })}
                        placeholder="#3b82f6"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="iconBackgroundColor">Container Background Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="iconBackgroundColor"
                        type="color"
                        value={formData.iconBackgroundColor || '#ffffff'}
                        onChange={(e) => setFormData({ ...formData, iconBackgroundColor: e.target.value })}
                        className="w-16 h-10"
                      />
                      <Input
                        type="text"
                        value={formData.iconBackgroundColor}
                        onChange={(e) => setFormData({ ...formData, iconBackgroundColor: e.target.value })}
                        placeholder="transparent"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="iconBackgroundOpacity">
                      Container Opacity: {formData.iconBackgroundOpacity}%
                    </Label>
                    <Slider
                      id="iconBackgroundOpacity"
                      min={0}
                      max={100}
                      step={5}
                      value={[formData.iconBackgroundOpacity]}
                      onValueChange={(value) => setFormData({ ...formData, iconBackgroundOpacity: value[0] })}
                    />
                  </div>
                </>
              )}
            </TabsContent>

            {/* Border Tab */}
            <TabsContent value="border" className="space-y-4 mt-0">
              {formData.nodeTypeCategory === 'standard' ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="borderColor">Border Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="borderColor"
                        type="color"
                        value={formData.borderColor}
                        onChange={(e) => setFormData({ ...formData, borderColor: e.target.value })}
                        className="w-16 h-10"
                      />
                      <Input
                        type="text"
                        value={formData.borderColor}
                        onChange={(e) => setFormData({ ...formData, borderColor: e.target.value })}
                        placeholder="#1a192b"
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
                      min={1}
                      max={10}
                      step={1}
                      value={[formData.borderWidth]}
                      onValueChange={(value) => setFormData({ ...formData, borderWidth: value[0] })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="borderRadius">Corner Radius</Label>
                    <Select
                      value={formData.borderRadius.toString()}
                      onValueChange={(value) => setFormData({ ...formData, borderRadius: parseInt(value) })}
                    >
                      <SelectTrigger id="borderRadius">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Square (0px)</SelectItem>
                        <SelectItem value="3">Slightly Rounded (3px)</SelectItem>
                        <SelectItem value="8">Rounded (8px)</SelectItem>
                        <SelectItem value="16">Very Rounded (16px)</SelectItem>
                        <SelectItem value="9999">Circle/Pill</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="iconBorderColor">Container Border Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="iconBorderColor"
                        type="color"
                        value={formData.iconBorderColor}
                        onChange={(e) => setFormData({ ...formData, iconBorderColor: e.target.value })}
                        className="w-16 h-10"
                      />
                      <Input
                        type="text"
                        value={formData.iconBorderColor}
                        onChange={(e) => setFormData({ ...formData, iconBorderColor: e.target.value })}
                        placeholder="#1a192b"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="iconBorderStyle">Border Style</Label>
                    <Select
                      value={formData.iconBorderStyle}
                      onValueChange={(value) => setFormData({ ...formData, iconBorderStyle: value as 'solid' | 'dashed' | 'dotted' })}
                    >
                      <SelectTrigger id="iconBorderStyle">
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
                    <Label htmlFor="iconBorderWidth">
                      Border Width: {formData.iconBorderWidth}px
                    </Label>
                    <Slider
                      id="iconBorderWidth"
                      min={0}
                      max={10}
                      step={1}
                      value={[formData.iconBorderWidth]}
                      onValueChange={(value) => setFormData({ ...formData, iconBorderWidth: value[0] })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="iconBorderRadius">Corner Radius</Label>
                    <Select
                      value={formData.iconBorderRadius.toString()}
                      onValueChange={(value) => setFormData({ ...formData, iconBorderRadius: parseInt(value) })}
                    >
                      <SelectTrigger id="iconBorderRadius">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Square (0px)</SelectItem>
                        <SelectItem value="4">Slightly Rounded (4px)</SelectItem>
                        <SelectItem value="8">Rounded (8px)</SelectItem>
                        <SelectItem value="16">Very Rounded (16px)</SelectItem>
                        <SelectItem value="9999">Circle</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </TabsContent>

            {/* Connections Tab */}
            <TabsContent value="connections" className="space-y-4 mt-0">
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="showHandles" className="text-base">Show Handles</Label>
                <Switch
                  id="showHandles"
                  checked={formData.handles.showHandles ?? true}
                  onCheckedChange={(checked) => setFormData({
                    ...formData,
                    handles: { ...formData.handles, showHandles: checked }
                  })}
                />
              </div>

              <div className="space-y-2">
                <Label>Connection Handles</Label>
                <p className="text-sm text-muted-foreground">
                  Configure which sides of the node can have connections
                </p>
                <HandlePositionSelector
                  value={formData.handles}
                  onChange={(handles) => setFormData({ ...formData, handles })}
                />
              </div>
            </TabsContent>
          </div>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!formData.name.trim()}>
            {editingId ? 'Save Changes' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
