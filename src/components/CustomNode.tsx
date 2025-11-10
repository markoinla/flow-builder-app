import { memo, useState, useEffect } from 'react';
import { Handle, Position, NodeProps, NodeResizer } from '@xyflow/react';
import type { NodeStyle, HandleConfig, HandleType } from '../types/node-types';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';

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

interface CustomNodeData {
  label: string;
  content?: string;
  style?: NodeStyle;
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
          style={{
            opacity: isHidden ? 0 : 1,
            pointerEvents: isHidden ? 'none' : 'auto'
          }}
        />
        <Handle
          type="target"
          position={position}
          id={`${position}-target`}
          style={{
            opacity: isHidden ? 0 : 1,
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
      style={{
        opacity: isHidden ? 0 : 1,
        pointerEvents: isHidden ? 'none' : 'auto'
      }}
    />
  );
};

export const CustomNode = memo(({ data, selected }: NodeProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPopoverHovered, setIsPopoverHovered] = useState(false);
  const [shouldShowPopover, setShouldShowPopover] = useState(false);

  const typedData = data as unknown as CustomNodeData;
  const style = typedData.style || {
    backgroundColor: '#ffffff',
    borderColor: '#1a192b',
    borderStyle: 'solid',
    borderWidth: 1,
    textColor: '#000000',
  };

  const handles = typedData.handles || { top: 'both', bottom: 'both' };
  const hasContent = typedData.content && typedData.content.trim().length > 0;

  // Calculate background color with opacity
  const backgroundColor = style.backgroundOpacity !== undefined
    ? hexToRgba(style.backgroundColor, style.backgroundOpacity)
    : style.backgroundColor;

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
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        padding: '10px 20px',
        borderRadius: style.borderRadius !== undefined ? `${style.borderRadius}px` : '3px',
        backgroundColor,
        borderColor: style.borderColor,
        borderStyle: style.borderStyle,
        borderWidth: `${style.borderWidth}px`,
        color: style.textColor || '#000000',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '14px',
        fontWeight: 500,
      }}
    >
      {renderHandle(Position.Top, handles.top)}
      {renderHandle(Position.Right, handles.right)}
      {renderHandle(Position.Bottom, handles.bottom)}
      {renderHandle(Position.Left, handles.left)}
      {typedData.label as React.ReactNode}
    </div>
  );

  return (
    <>
      <NodeResizer isVisible={selected} minWidth={100} minHeight={40} />
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
            <div dangerouslySetInnerHTML={{ __html: typedData.content || '' }} />
          </PopoverContent>
        </Popover>
      ) : (
        nodeContent
      )}
    </>
  );
});

CustomNode.displayName = 'CustomNode';
