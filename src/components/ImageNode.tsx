import { memo, useState } from 'react';
import { Handle, Position, type NodeProps, NodeResizer } from '@xyflow/react';
import type { HandleConfig, HandleType } from '../types/node-types';
import { Upload } from 'lucide-react';

export interface ImageNodeData {
  imageUrl?: string;
  imageSize?: number;
  opacity?: number;
  backgroundColor?: string;
  backgroundOpacity?: number;
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

export const ImageNode = memo(({ data, selected }: NodeProps<ImageNodeData>) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const imageSize = data.imageSize || 100;
  const opacity = data.opacity !== undefined ? data.opacity / 100 : 1;
  const handles = data.handles || { top: 'both', bottom: 'both' };

  // Calculate background color with opacity
  const backgroundColor = data.backgroundColor
    ? data.backgroundOpacity !== undefined
      ? hexToRgba(data.backgroundColor, data.backgroundOpacity)
      : data.backgroundColor
    : '#ffffff';

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    // File drop handling would be managed by parent component
    // This is just for visual feedback
  };

  return (
    <>
      <NodeResizer isVisible={selected} minWidth={100} minHeight={100} />
      <div
        className="relative w-full h-full flex items-center justify-center"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          borderColor: data.borderColor || '#e5e5e5',
          borderStyle: data.borderStyle || 'solid',
          borderWidth: data.borderWidth !== undefined ? `${data.borderWidth}px` : '1px',
          borderRadius: data.borderRadius !== undefined ? `${data.borderRadius}px` : '4px',
          backgroundColor: dragOver ? '#f0f9ff' : backgroundColor,
        }}
      >
        {data.imageUrl ? (
          <img
            src={data.imageUrl}
            alt="Uploaded content"
            style={{
              width: `${imageSize}%`,
              height: `${imageSize}%`,
              opacity,
              objectFit: 'contain',
              borderRadius: data.borderRadius !== undefined ? `${data.borderRadius}px` : '4px',
            }}
            className="pointer-events-none"
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 text-gray-400 p-4">
            <Upload size={32} />
            <span className="text-xs text-center">
              Right-click and select<br />"Edit Image" to upload
            </span>
          </div>
        )}

        {/* Connection handles - configurable */}
        {renderHandle(Position.Top, handles.top)}
        {renderHandle(Position.Right, handles.right)}
        {renderHandle(Position.Bottom, handles.bottom)}
        {renderHandle(Position.Left, handles.left)}
      </div>
    </>
  );
});

ImageNode.displayName = 'ImageNode';
