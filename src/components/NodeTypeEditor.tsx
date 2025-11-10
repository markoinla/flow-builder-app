import { useState, useEffect } from 'react';
import type { CustomNodeType, HandleConfig } from '../types/node-types';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Slider } from './ui/slider';
import { Switch } from './ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { IconPicker, type IconName } from './ui/icon-picker';
import { HandlePositionSelector } from './HandlePositionSelector';
import { FileUpload } from './ui/file-upload';
import { Copy } from 'lucide-react';

interface NodeTypeEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingId: string | null;
  initialData: NodeTypeFormData;
  onSave: (nodeType: CustomNodeType) => void;
  onDelete?: (id: string) => void;
  onDuplicate?: (nodeType: CustomNodeType) => void;
}

export interface NodeTypeFormData {
  name: string;
  nodeTypeCategory: 'standard' | 'icon' | 'content' | 'image';
  // Standard/Content node fields
  backgroundColor: string;
  backgroundOpacity: number;
  borderColor: string;
  borderStyle: 'solid' | 'dashed' | 'dotted';
  borderWidth: number;
  textColor: string;
  borderRadius: number;
  fontFamily: string;
  fontSize: number;
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
  // Image node fields
  imageUrl: string;
  imageSize: number;
  imageOpacity: number;
  imageBackgroundColor: string;
  imageBackgroundOpacity: number;
  imageBorderColor: string;
  imageBorderStyle: 'solid' | 'dashed' | 'dotted';
  imageBorderWidth: number;
  imageBorderRadius: number;
  // Handle configuration
  handles: HandleConfig;
}

export function NodeTypeEditor({
  open,
  onOpenChange,
  editingId,
  initialData,
  onSave,
  onDelete,
  onDuplicate,
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
    } else if (formData.nodeTypeCategory === 'content') {
      nodeType = {
        id: editingId || `content_${Date.now()}`,
        name: formData.name,
        type: 'content',
        style: {
          backgroundColor: formData.backgroundColor,
          backgroundOpacity: formData.backgroundOpacity,
          borderColor: formData.borderColor,
          borderStyle: formData.borderStyle,
          borderWidth: formData.borderWidth,
          textColor: formData.textColor,
          borderRadius: formData.borderRadius,
          fontFamily: formData.fontFamily,
          fontSize: formData.fontSize,
        },
        handles: formData.handles,
      };
    } else if (formData.nodeTypeCategory === 'image') {
      nodeType = {
        id: editingId || `image_${Date.now()}`,
        name: formData.name,
        type: 'image',
        imageStyle: {
          imageSize: formData.imageSize,
          opacity: formData.imageOpacity,
          backgroundColor: formData.imageBackgroundColor,
          backgroundOpacity: formData.imageBackgroundOpacity,
          borderColor: formData.imageBorderColor,
          borderStyle: formData.imageBorderStyle,
          borderWidth: formData.imageBorderWidth,
          borderRadius: formData.imageBorderRadius,
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

  const handleDelete = () => {
    if (editingId && onDelete) {
      onDelete(editingId);
      onOpenChange(false);
    }
  };

  const handleDuplicate = () => {
    if (editingId && onDuplicate) {
      // Create a new node type based on current form data
      let nodeType: CustomNodeType;

      if (formData.nodeTypeCategory === 'icon') {
        nodeType = {
          id: `custom_${Date.now()}`,
          name: `${formData.name} (Copy)`,
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
      } else if (formData.nodeTypeCategory === 'content') {
        nodeType = {
          id: `custom_${Date.now()}`,
          name: `${formData.name} (Copy)`,
          type: 'content',
          style: {
            backgroundColor: formData.backgroundColor,
            backgroundOpacity: formData.backgroundOpacity,
            borderColor: formData.borderColor,
            borderStyle: formData.borderStyle,
            borderWidth: formData.borderWidth,
            textColor: formData.textColor,
            borderRadius: formData.borderRadius,
            fontFamily: formData.fontFamily,
            fontSize: formData.fontSize,
          },
          handles: formData.handles,
        };
      } else if (formData.nodeTypeCategory === 'image') {
        nodeType = {
          id: `custom_${Date.now()}`,
          name: `${formData.name} (Copy)`,
          type: 'image',
          imageStyle: {
            imageSize: formData.imageSize,
            opacity: formData.imageOpacity,
            backgroundColor: formData.imageBackgroundColor,
            backgroundOpacity: formData.imageBackgroundOpacity,
            borderColor: formData.imageBorderColor,
            borderStyle: formData.imageBorderStyle,
            borderWidth: formData.imageBorderWidth,
            borderRadius: formData.imageBorderRadius,
          },
          handles: formData.handles,
        };
      } else {
        nodeType = {
          id: `custom_${Date.now()}`,
          name: `${formData.name} (Copy)`,
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

      onDuplicate(nodeType);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingId ? 'Edit Node Type' : 'Create Node Type'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Category Selector - Always visible and prominent */}
          <div className="space-y-2 pb-4 border-b">
            <Label htmlFor="nodeTypeCategory" className="text-base font-semibold">Node Category</Label>
            <Select
              value={formData.nodeTypeCategory}
              onValueChange={(value) => setFormData({ ...formData, nodeTypeCategory: value as 'standard' | 'icon' | 'content' | 'image' })}
              disabled={!!editingId}
            >
              <SelectTrigger id="nodeTypeCategory" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard Node</SelectItem>
                <SelectItem value="icon">Icon Node</SelectItem>
                <SelectItem value="content">Content Node</SelectItem>
                <SelectItem value="image">Image Node</SelectItem>
              </SelectContent>
            </Select>
            {editingId && (
              <p className="text-xs text-muted-foreground">Category cannot be changed after creation</p>
            )}
          </div>

          {/* Tabbed Sections */}
          <Tabs defaultValue="basic" className="border-t pt-2">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic</TabsTrigger>
              <TabsTrigger value="appearance">Appearance</TabsTrigger>
              <TabsTrigger value="border">Border</TabsTrigger>
              <TabsTrigger value="connections">Connections</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter node type name"
                />
              </div>

              {/* Content node-specific fields */}
              {formData.nodeTypeCategory === 'content' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="fontFamily">Font Family</Label>
                    <Select
                      value={formData.fontFamily}
                      onValueChange={(value) => setFormData({ ...formData, fontFamily: value })}
                    >
                      <SelectTrigger id="fontFamily">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Inter">Inter</SelectItem>
                        <SelectItem value="Roboto">Roboto</SelectItem>
                        <SelectItem value="Open Sans">Open Sans</SelectItem>
                        <SelectItem value="Lato">Lato</SelectItem>
                        <SelectItem value="Montserrat">Montserrat</SelectItem>
                        <SelectItem value="Poppins">Poppins</SelectItem>
                        <SelectItem value="Playfair Display">Playfair Display</SelectItem>
                        <SelectItem value="Merriweather">Merriweather</SelectItem>
                        <SelectItem value="Ubuntu">Ubuntu</SelectItem>
                        <SelectItem value="Nunito">Nunito</SelectItem>
                        <SelectItem value="Raleway">Raleway</SelectItem>
                        <SelectItem value="Source Sans Pro">Source Sans Pro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contentTextColor">Text Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="contentTextColor"
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

                  <div className="space-y-2">
                    <Label htmlFor="fontSize">
                      Base Font Size: {formData.fontSize}px
                    </Label>
                    <Slider
                      id="fontSize"
                      min={10}
                      max={24}
                      step={1}
                      value={[formData.fontSize]}
                      onValueChange={(value) => setFormData({ ...formData, fontSize: value[0] })}
                    />
                  </div>
                </>
              )}

              {/* Icon-specific fields */}
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

              {/* Image node-specific fields */}
              {formData.nodeTypeCategory === 'image' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="imageSize">
                      Default Image Size: {formData.imageSize}%
                    </Label>
                    <Slider
                      id="imageSize"
                      min={10}
                      max={100}
                      step={5}
                      value={[formData.imageSize]}
                      onValueChange={(value) => setFormData({ ...formData, imageSize: value[0] })}
                    />
                    <p className="text-xs text-muted-foreground">
                      Default size for images in nodes of this type
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="imageOpacity">
                      Default Opacity: {formData.imageOpacity}%
                    </Label>
                    <Slider
                      id="imageOpacity"
                      min={0}
                      max={100}
                      step={5}
                      value={[formData.imageOpacity]}
                      onValueChange={(value) => setFormData({ ...formData, imageOpacity: value[0] })}
                    />
                    <p className="text-xs text-muted-foreground">
                      Default opacity for images in nodes of this type
                    </p>
                  </div>

                  <div className="p-3 bg-muted rounded-md">
                    <p className="text-sm text-muted-foreground">
                      <strong>Note:</strong> Images are set per node instance. After adding this node type to the canvas, right-click the node and select "Edit Image" to upload or set an image.
                    </p>
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="appearance" className="space-y-4 pt-2">
              {(formData.nodeTypeCategory === 'standard' || formData.nodeTypeCategory === 'content') ? (
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
              ) : formData.nodeTypeCategory === 'icon' ? (
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
              ) : formData.nodeTypeCategory === 'image' ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="imageBackgroundColor">Background Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="imageBackgroundColor"
                        type="color"
                        value={formData.imageBackgroundColor}
                        onChange={(e) => setFormData({ ...formData, imageBackgroundColor: e.target.value })}
                        className="w-16 h-10"
                      />
                      <Input
                        type="text"
                        value={formData.imageBackgroundColor}
                        onChange={(e) => setFormData({ ...formData, imageBackgroundColor: e.target.value })}
                        placeholder="#ffffff"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="imageBackgroundOpacity">
                      Background Opacity: {formData.imageBackgroundOpacity}%
                    </Label>
                    <Slider
                      id="imageBackgroundOpacity"
                      min={0}
                      max={100}
                      step={5}
                      value={[formData.imageBackgroundOpacity]}
                      onValueChange={(value) => setFormData({ ...formData, imageBackgroundOpacity: value[0] })}
                    />
                  </div>

                  <p className="text-xs text-muted-foreground mt-4">
                    Image size and opacity are configured in the Basic tab.
                  </p>
                </>
              ) : null}
            </TabsContent>

            <TabsContent value="border" className="space-y-4 pt-2">
              {(formData.nodeTypeCategory === 'standard' || formData.nodeTypeCategory === 'content') ? (
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
                      min={0}
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
              ) : formData.nodeTypeCategory === 'icon' ? (
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
              ) : formData.nodeTypeCategory === 'image' ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="imageBorderColor">Border Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="imageBorderColor"
                        type="color"
                        value={formData.imageBorderColor}
                        onChange={(e) => setFormData({ ...formData, imageBorderColor: e.target.value })}
                        className="w-16 h-10"
                      />
                      <Input
                        type="text"
                        value={formData.imageBorderColor}
                        onChange={(e) => setFormData({ ...formData, imageBorderColor: e.target.value })}
                        placeholder="#e5e5e5"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="imageBorderStyle">Border Style</Label>
                    <Select
                      value={formData.imageBorderStyle}
                      onValueChange={(value) => setFormData({ ...formData, imageBorderStyle: value as 'solid' | 'dashed' | 'dotted' })}
                    >
                      <SelectTrigger id="imageBorderStyle">
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
                    <Label htmlFor="imageBorderWidth">
                      Border Width: {formData.imageBorderWidth}px
                    </Label>
                    <Slider
                      id="imageBorderWidth"
                      min={0}
                      max={10}
                      step={1}
                      value={[formData.imageBorderWidth]}
                      onValueChange={(value) => setFormData({ ...formData, imageBorderWidth: value[0] })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="imageBorderRadius">Corner Radius</Label>
                    <Select
                      value={formData.imageBorderRadius.toString()}
                      onValueChange={(value) => setFormData({ ...formData, imageBorderRadius: parseInt(value) })}
                    >
                      <SelectTrigger id="imageBorderRadius">
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
              ) : null}
            </TabsContent>

            <TabsContent value="connections" className="space-y-4 pt-2">
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
          </Tabs>
        </div>

        <DialogFooter className="flex justify-between items-center">
          <div className="flex gap-2">
            {editingId && onDelete && (
              <Button variant="destructive" onClick={handleDelete}>
                Delete
              </Button>
            )}
            {editingId && (
              <Button variant="outline" onClick={handleDuplicate}>
                <Copy className="h-4 w-4 mr-2" />
                Duplicate
              </Button>
            )}
          </div>
          <div className="flex gap-2 ml-auto">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!formData.name.trim()}>
              {editingId ? 'Save Changes' : 'Create'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
