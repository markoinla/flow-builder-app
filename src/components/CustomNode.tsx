import { memo, useState } from 'react';
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
  if (!handleType) return null;

  if (handleType === 'both') {
    return (
      <>
        <Handle type="source" position={position} id={`${position}-source`} />
        <Handle type="target" position={position} id={`${position}-target`} />
      </>
    );
  }

  return <Handle type={handleType} position={position} />;
};

export const CustomNode = memo(({ data, selected }: NodeProps<CustomNodeData>) => {
  const [isHovered, setIsHovered] = useState(false);

  const style = data.style || {
    backgroundColor: '#ffffff',
    borderColor: '#1a192b',
    borderStyle: 'solid',
    borderWidth: 1,
    textColor: '#000000',
  };

  const handles = data.handles || { top: 'both', bottom: 'both' };
  const showHandles = handles.showHandles ?? true;
  const hasContent = data.content && data.content.trim().length > 0;

  // Calculate background color with opacity
  const backgroundColor = style.backgroundOpacity !== undefined
    ? hexToRgba(style.backgroundColor, style.backgroundOpacity)
    : style.backgroundColor;

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
      {showHandles && renderHandle(Position.Top, handles.top)}
      {showHandles && renderHandle(Position.Right, handles.right)}
      {showHandles && renderHandle(Position.Bottom, handles.bottom)}
      {showHandles && renderHandle(Position.Left, handles.left)}
      {data.label}
    </div>
  );

  return (
    <>
      <NodeResizer isVisible={selected} minWidth={100} minHeight={40} />
      {hasContent ? (
        <Popover open={isHovered}>
          <PopoverTrigger asChild>
            {nodeContent}
          </PopoverTrigger>
          <PopoverContent
            className="max-w-sm prose prose-sm"
            side="top"
            align="center"
            onOpenAutoFocus={(e) => e.preventDefault()}
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

CustomNode.displayName = 'CustomNode';
