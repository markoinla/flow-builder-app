import { useState } from 'react';
import type { CustomNodeType, HandleConfig } from '../types/node-types';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { NodeTypeEditor, type NodeTypeFormData } from './NodeTypeEditor';
import { type IconName } from './ui/icon-picker';
import { Trash2, Plus, Edit } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

// Helper function to convert kebab-case to PascalCase
const kebabToPascal = (str: string): string => {
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
};

interface NodePaletteProps {
  nodeTypes: CustomNodeType[];
  onAddNodeType: (nodeType: CustomNodeType) => void;
  onEditNodeType: (id: string, nodeType: CustomNodeType) => void;
  onDeleteNodeType: (id: string) => void;
  onDragStart: (event: React.DragEvent, nodeType: CustomNodeType) => void;
}

const getDefaultFormData = (): NodeTypeFormData => ({
  name: '',
  nodeTypeCategory: 'standard',
  // Standard node fields
  backgroundColor: '#ffffff',
  backgroundOpacity: 100,
  borderColor: '#1a192b',
  borderStyle: 'solid',
  borderWidth: 1,
  textColor: '#000000',
  borderRadius: 3,
  fontFamily: 'Inter',
  fontSize: 14,
  // Icon node fields
  iconName: 'box' as IconName,
  iconSize: 32,
  iconColor: '#3b82f6',
  iconBackgroundColor: '',
  iconBackgroundOpacity: 100,
  showLabel: true,
  labelPosition: 'bottom',
  labelColor: '#000000',
  iconBorderColor: '#1a192b',
  iconBorderStyle: 'solid',
  iconBorderWidth: 0,
  iconBorderRadius: 8,
  // Image node fields
  imageUrl: '',
  imageSize: 100,
  imageOpacity: 100,
  imageBackgroundColor: '#ffffff',
  imageBackgroundOpacity: 100,
  imageBorderColor: '#e5e5e5',
  imageBorderStyle: 'solid',
  imageBorderWidth: 1,
  imageBorderRadius: 4,
  // Handle configuration
  handles: { top: 'both', bottom: 'both' } as HandleConfig,
});

export function NodePalette({
  nodeTypes,
  onAddNodeType,
  onEditNodeType,
  onDeleteNodeType,
  onDragStart,
}: NodePaletteProps) {
  const [showEditor, setShowEditor] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<NodeTypeFormData>(getDefaultFormData());

  const handleCreate = () => {
    setEditingId(null);
    setFormData(getDefaultFormData());
    setShowEditor(true);
  };

  const handleEdit = (nodeType: CustomNodeType) => {
    setEditingId(nodeType.id);

    if (nodeType.type === 'icon' && nodeType.iconStyle) {
      setFormData({
        name: nodeType.name,
        nodeTypeCategory: 'icon',
        backgroundColor: '#ffffff',
        backgroundOpacity: 100,
        borderColor: '#1a192b',
        borderStyle: 'solid',
        borderWidth: 1,
        textColor: '#000000',
        borderRadius: 3,
        fontFamily: 'Inter',
        fontSize: 14,
        iconName: nodeType.iconStyle.iconName as IconName,
        iconSize: nodeType.iconStyle.iconSize || 32,
        iconColor: nodeType.iconStyle.iconColor,
        iconBackgroundColor: nodeType.iconStyle.backgroundColor || '',
        iconBackgroundOpacity: nodeType.iconStyle.backgroundOpacity ?? 100,
        showLabel: nodeType.iconStyle.showLabel ?? true,
        labelPosition: nodeType.iconStyle.labelPosition || 'bottom',
        labelColor: nodeType.iconStyle.labelColor || '#000000',
        iconBorderColor: nodeType.iconStyle.borderColor || '#1a192b',
        iconBorderStyle: nodeType.iconStyle.borderStyle || 'solid',
        iconBorderWidth: nodeType.iconStyle.borderWidth ?? 0,
        iconBorderRadius: nodeType.iconStyle.borderRadius ?? 8,
        imageUrl: '',
        imageSize: 100,
        imageOpacity: 100,
        imageBackgroundColor: '#ffffff',
        imageBackgroundOpacity: 100,
        imageBorderColor: '#e5e5e5',
        imageBorderStyle: 'solid',
        imageBorderWidth: 1,
        imageBorderRadius: 4,
        handles: nodeType.handles || { top: 'both', bottom: 'both' },
      });
    } else if (nodeType.type === 'content' && nodeType.style) {
      setFormData({
        name: nodeType.name,
        nodeTypeCategory: 'content',
        backgroundColor: nodeType.style.backgroundColor,
        backgroundOpacity: nodeType.style.backgroundOpacity ?? 100,
        borderColor: nodeType.style.borderColor,
        borderStyle: nodeType.style.borderStyle,
        borderWidth: nodeType.style.borderWidth,
        textColor: nodeType.style.textColor || '#000000',
        borderRadius: nodeType.style.borderRadius ?? 3,
        fontFamily: nodeType.style.fontFamily || 'Inter',
        fontSize: nodeType.style.fontSize || 14,
        iconName: 'box' as IconName,
        iconSize: 32,
        iconColor: '#3b82f6',
        iconBackgroundColor: '',
        iconBackgroundOpacity: 100,
        showLabel: true,
        labelPosition: 'bottom',
        labelColor: '#000000',
        iconBorderColor: '#1a192b',
        iconBorderStyle: 'solid',
        iconBorderWidth: 0,
        iconBorderRadius: 8,
        imageUrl: '',
        imageSize: 100,
        imageOpacity: 100,
        imageBackgroundColor: '#ffffff',
        imageBackgroundOpacity: 100,
        imageBorderColor: '#e5e5e5',
        imageBorderStyle: 'solid',
        imageBorderWidth: 1,
        imageBorderRadius: 4,
        handles: nodeType.handles || { top: 'both', bottom: 'both' },
      });
    } else if (nodeType.type === 'image' && nodeType.imageStyle) {
      setFormData({
        name: nodeType.name,
        nodeTypeCategory: 'image',
        backgroundColor: '#ffffff',
        backgroundOpacity: 100,
        borderColor: '#1a192b',
        borderStyle: 'solid',
        borderWidth: 1,
        textColor: '#000000',
        borderRadius: 3,
        fontFamily: 'Inter',
        fontSize: 14,
        iconName: 'box' as IconName,
        iconSize: 32,
        iconColor: '#3b82f6',
        iconBackgroundColor: '',
        iconBackgroundOpacity: 100,
        showLabel: true,
        labelPosition: 'bottom',
        labelColor: '#000000',
        iconBorderColor: '#1a192b',
        iconBorderStyle: 'solid',
        iconBorderWidth: 0,
        iconBorderRadius: 8,
        imageUrl: nodeType.imageStyle.imageUrl || '',
        imageSize: nodeType.imageStyle.imageSize || 100,
        imageOpacity: nodeType.imageStyle.opacity ?? 100,
        imageBackgroundColor: nodeType.imageStyle.backgroundColor || '#ffffff',
        imageBackgroundOpacity: nodeType.imageStyle.backgroundOpacity ?? 100,
        imageBorderColor: nodeType.imageStyle.borderColor || '#e5e5e5',
        imageBorderStyle: nodeType.imageStyle.borderStyle || 'solid',
        imageBorderWidth: nodeType.imageStyle.borderWidth ?? 1,
        imageBorderRadius: nodeType.imageStyle.borderRadius ?? 4,
        handles: nodeType.handles || { top: 'both', bottom: 'both' },
      });
    } else if (nodeType.style) {
      setFormData({
        name: nodeType.name,
        nodeTypeCategory: 'standard',
        backgroundColor: nodeType.style.backgroundColor,
        backgroundOpacity: nodeType.style.backgroundOpacity ?? 100,
        borderColor: nodeType.style.borderColor,
        borderStyle: nodeType.style.borderStyle,
        borderWidth: nodeType.style.borderWidth,
        textColor: nodeType.style.textColor || '#000000',
        borderRadius: nodeType.style.borderRadius ?? 3,
        fontFamily: nodeType.style.fontFamily || 'Inter',
        fontSize: nodeType.style.fontSize || 14,
        iconName: 'box' as IconName,
        iconSize: 32,
        iconColor: '#3b82f6',
        iconBackgroundColor: '',
        iconBackgroundOpacity: 100,
        showLabel: true,
        labelPosition: 'bottom',
        labelColor: '#000000',
        iconBorderColor: '#1a192b',
        iconBorderStyle: 'solid',
        iconBorderWidth: 0,
        iconBorderRadius: 8,
        imageUrl: '',
        imageSize: 100,
        imageOpacity: 100,
        imageBackgroundColor: '#ffffff',
        imageBackgroundOpacity: 100,
        imageBorderColor: '#e5e5e5',
        imageBorderStyle: 'solid',
        imageBorderWidth: 1,
        imageBorderRadius: 4,
        handles: nodeType.handles || { top: 'both', bottom: 'both' },
      });
    }

    setShowEditor(true);
  };

  const handleSave = (nodeType: CustomNodeType) => {
    if (editingId) {
      onEditNodeType(editingId, nodeType);
    } else {
      onAddNodeType(nodeType);
    }
  };

  const handleDuplicate = (nodeType: CustomNodeType) => {
    // Always add as a new node type when duplicating
    onAddNodeType(nodeType);
  };

  return (
    <>
      <div className="w-64 bg-background border-r p-4 overflow-y-auto">
        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2">Node Types</h2>
          <Button
            onClick={handleCreate}
            className="w-full"
            variant="default"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Node Type
          </Button>
        </div>

        <Separator className="my-4" />

        <div className="space-y-2">
          {nodeTypes.map((nodeType) => {
            // Convert kebab-case icon names to PascalCase for Lucide icon lookup
            const iconKey = nodeType.type === 'icon' && nodeType.iconStyle
              ? kebabToPascal(nodeType.iconStyle.iconName)
              : null;
            const IconComponent = iconKey ? (LucideIcons as any)[iconKey] : null;

            return (
              <div
                key={nodeType.id}
                className="group relative"
              >
                <div
                  draggable
                  onDragStart={(e) => onDragStart(e, nodeType)}
                  className="cursor-move p-3 rounded-md transition-all hover:ring-2 hover:ring-primary border"
                  style={{
                    backgroundColor: nodeType.type === 'icon'
                      ? nodeType.iconStyle?.backgroundColor || 'transparent'
                      : nodeType.style?.backgroundColor,
                    borderColor: nodeType.style?.borderColor || '#1a192b',
                    borderStyle: nodeType.style?.borderStyle || 'solid',
                    borderWidth: `${nodeType.style?.borderWidth || 1}px`,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {nodeType.type === 'icon' && IconComponent && (
                        <IconComponent
                          size={20}
                          color={nodeType.iconStyle?.iconColor || '#000'}
                        />
                      )}
                      <span
                        className="font-medium text-sm"
                        style={{
                          color: nodeType.type === 'icon'
                            ? nodeType.iconStyle?.labelColor || '#000'
                            : nodeType.style?.textColor || '#000',
                        }}
                      >
                        {nodeType.name}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    onClick={() => handleEdit(nodeType)}
                    size="sm"
                    variant="secondary"
                    className="h-6 w-6 p-0"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  {!nodeType.id.startsWith('default') &&
                    !nodeType.id.startsWith('process') &&
                    !nodeType.id.startsWith('decision') &&
                    !nodeType.id.startsWith('data') &&
                    !nodeType.id.startsWith('output') &&
                    !nodeType.id.startsWith('icon-') && (
                    <Button
                      onClick={() => onDeleteNodeType(nodeType.id)}
                      size="sm"
                      variant="destructive"
                      className="h-6 w-6 p-0"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <NodeTypeEditor
        open={showEditor}
        onOpenChange={setShowEditor}
        editingId={editingId}
        initialData={formData}
        onSave={handleSave}
        onDelete={onDeleteNodeType}
        onDuplicate={handleDuplicate}
      />
    </>
  );
}
