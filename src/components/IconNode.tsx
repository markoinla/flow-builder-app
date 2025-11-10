import { memo, useState, useEffect } from 'react';
import { Handle, Position, type NodeProps, NodeResizer } from '@xyflow/react';
import * as LucideIcons from 'lucide-react';
import type { HandleConfig, HandleType } from '../types/node-types';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';

export interface IconNodeData {
  iconName: string;
  iconSize?: number;
  iconColor: string;
  backgroundColor?: string;
  backgroundOpacity?: number;
  label?: string;
  content?: string;
  showLabel?: boolean;
  labelPosition?: 'top' | 'bottom';
  labelColor?: string;
  borderColor?: string;
  borderStyle?: 'solid' | 'dashed' | 'dotted';
  borderWidth?: number;
  borderRadius?: number;
  handles?: HandleConfig;
}

const renderHandle = (position: Position, handleType?: HandleType) => {
  const isHidden = !handleType;

  if (!handleType || handleType === 'both') {
    return (
      <>
        <Handle
          type="source"
          position={position}
          id={`${position}-source`}
          className="w-2 h-2 !bg-gray-400"
          style={{
            opacity: isHidden ? 0 : 0.3,
            pointerEvents: isHidden ? 'none' : 'auto'
          }}
        />
        <Handle
          type="target"
          position={position}
          id={`${position}-target`}
          className="w-2 h-2 !bg-gray-400"
          style={{
            opacity: isHidden ? 0 : 0.3,
            pointerEvents: isHidden ? 'none' : 'auto'
          }}
        />
      </>
    );
  }

  return (
    <Handle
      type={handleType}
      position={position}
      className="w-2 h-2 !bg-gray-400"
      style={{
        opacity: isHidden ? 0 : 0.3,
        pointerEvents: isHidden ? 'none' : 'auto'
      }}
    />
  );
};

// Helper function to convert kebab-case to PascalCase
const kebabToPascal = (str: string): string => {
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
};

// Helper function to convert hex color to rgba with opacity
const hexToRgba = (hex: string, opacity: number): string => {
  // Remove # if present
  hex = hex.replace('#', '');

  // Parse hex values
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Convert opacity from 0-100 to 0-1
  const alpha = opacity / 100;

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const IconNode = memo(({ data, selected }: NodeProps<IconNodeData>) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPopoverHovered, setIsPopoverHovered] = useState(false);
  const [shouldShowPopover, setShouldShowPopover] = useState(false);

  // Dynamically get the icon component from Lucide
  // Convert kebab-case icon names (e.g., 'database', 'alert-circle') to PascalCase (e.g., 'Database', 'AlertCircle')
  const iconKey = kebabToPascal(data.iconName);
  const IconComponent = (LucideIcons as any)[iconKey] as React.ComponentType<{
    size: number;
    color: string;
    className?: string;
  }>;

  const iconSize = data.iconSize || 32;
  const showLabel = data.showLabel ?? true;
  const labelPosition = data.labelPosition || 'bottom';
  const handles = data.handles || { top: 'both', bottom: 'both' };
  const hasContent = data.content && data.content.trim().length > 0;

  // Calculate background color with opacity
  const backgroundColor = data.backgroundColor
    ? data.backgroundOpacity !== undefined
      ? hexToRgba(data.backgroundColor, data.backgroundOpacity)
      : data.backgroundColor
    : 'transparent';

  // Update popover visibility with a small delay to prevent animation flicker
  useEffect(() => {
    if (isHovered || isPopoverHovered) {
      setShouldShowPopover(true);
    } else {
      const timer = setTimeout(() => setShouldShowPopover(false), 100);
      return () => clearTimeout(timer);
    }
  }, [isHovered, isPopoverHovered]);

  const nodeContent = (
    <div
      className="flex flex-col items-center gap-1 w-full h-full justify-center"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
        {/* Top label */}
        {showLabel && labelPosition === 'top' && (
          <span
            style={{ color: data.labelColor || '#000' }}
            className="text-xs font-medium"
          >
            {data.label}
          </span>
        )}

        {/* Icon container */}
        <div
          style={{
            padding: '8px',
            borderRadius: data.borderRadius !== undefined ? `${data.borderRadius}px` : '4px',
            backgroundColor,
            borderColor: data.borderColor,
            borderStyle: data.borderStyle || 'solid',
            borderWidth: data.borderWidth !== undefined ? `${data.borderWidth}px` : '0px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          className="relative"
        >
          {IconComponent ? (
            <IconComponent size={iconSize} color={data.iconColor} />
          ) : (
            <LucideIcons.HelpCircle size={iconSize} color="#999" />
          )}

          {/* Connection handles - configurable */}
          {renderHandle(Position.Top, handles.top)}
          {renderHandle(Position.Right, handles.right)}
          {renderHandle(Position.Bottom, handles.bottom)}
          {renderHandle(Position.Left, handles.left)}
        </div>

        {/* Bottom label */}
        {showLabel && labelPosition === 'bottom' && (
          <span
            style={{ color: data.labelColor || '#000' }}
            className="text-xs font-medium"
          >
            {data.label}
          </span>
        )}
    </div>
  );

  return (
    <>
      <NodeResizer isVisible={selected} minWidth={50} minHeight={50} />
      {hasContent ? (
        <Popover open={shouldShowPopover}>
          <PopoverTrigger asChild>
            {nodeContent}
          </PopoverTrigger>
          <PopoverContent
            className="w-auto max-w-2xl prose prose-sm"
            side="top"
            align="center"
            onOpenAutoFocus={(e) => e.preventDefault()}
            onMouseEnter={() => setIsPopoverHovered(true)}
            onMouseLeave={() => setIsPopoverHovered(false)}
          >
            <div dangerouslySetInnerHTML={{ __html: data.content }} />
          </PopoverContent>
        </Popover>
      ) : (
        nodeContent
      )}
    </>
  );
});

IconNode.displayName = 'IconNode';
