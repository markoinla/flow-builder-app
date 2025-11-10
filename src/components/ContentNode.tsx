import { memo } from 'react';
import { Handle, Position, NodeProps, NodeResizer } from '@xyflow/react';
import type { NodeStyle, HandleConfig, HandleType } from '../types/node-types';
import type { TextSize } from './ContentEditDialog';

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

// Map text size to scale multiplier
const getTextSizeScale = (textSize?: TextSize): number => {
  switch (textSize) {
    case 'small':
      return 0.75; // 75% of default
    case 'medium':
      return 1; // 100% (default)
    case 'large':
      return 1.25; // 125%
    case 'extra-large':
      return 1.5; // 150%
    default:
      return 1;
  }
};

interface ContentNodeData {
  label: string;
  content?: string;
  textSize?: TextSize;
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

export const ContentNode = memo(({ data, selected }: NodeProps<ContentNodeData>) => {
  const style = data.style || {
    backgroundColor: '#ffffff',
    borderColor: '#1a192b',
    borderStyle: 'solid',
    borderWidth: 1,
    textColor: '#000000',
  };

  const handles = data.handles || { top: 'both', bottom: 'both' };
  const hasContent = data.content && data.content.trim().length > 0;

  // Calculate background color with opacity
  const backgroundColor = style.backgroundOpacity !== undefined
    ? hexToRgba(style.backgroundColor, style.backgroundOpacity)
    : style.backgroundColor;

  return (
    <>
      <NodeResizer isVisible={selected} minWidth={150} minHeight={100} />
      <div
        style={{
          padding: '10px',
          borderRadius: style.borderRadius !== undefined ? `${style.borderRadius}px` : '3px',
          backgroundColor,
          borderColor: style.borderColor,
          borderStyle: style.borderStyle,
          borderWidth: `${style.borderWidth}px`,
          color: style.textColor || '#000000',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          fontSize: '14px',
          overflow: 'auto',
        }}
      >
        {renderHandle(Position.Top, handles.top)}
        {renderHandle(Position.Right, handles.right)}
        {renderHandle(Position.Bottom, handles.bottom)}
        {renderHandle(Position.Left, handles.left)}

        {hasContent ? (
          <div
            className="prose prose-sm max-w-none"
            style={{
              transform: `scale(${getTextSizeScale(data.textSize)})`,
              transformOrigin: 'top left',
              width: `${100 / getTextSizeScale(data.textSize)}%`,
              fontFamily: style.fontFamily || 'Inter',
              fontSize: style.fontSize ? `${style.fontSize}px` : '14px',
            }}
            dangerouslySetInnerHTML={{ __html: data.content }}
          />
        ) : (
          <div
            className="flex items-center justify-center h-full text-muted-foreground"
            style={{
              fontFamily: style.fontFamily || 'Inter',
              fontSize: style.fontSize ? `${style.fontSize}px` : '14px',
            }}
          >
            {data.label || 'Right-click to edit content'}
          </div>
        )}
      </div>
    </>
  );
});

ContentNode.displayName = 'ContentNode';
