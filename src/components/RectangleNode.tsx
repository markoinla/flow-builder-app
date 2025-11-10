import {
  NodeResizer,
  type NodeProps,
} from '@xyflow/react';

export interface RectangleNodeData {
  color: string;
  opacity?: number;
  borderColor?: string;
  borderStyle?: 'solid' | 'dashed' | 'dotted';
  borderWidth?: number;
  borderRadius?: number;
  cornerDecoration?: 'none' | 'square' | 'circle' | 'square-outline' | 'circle-outline';
  cornerDecorationSize?: number;
}

const styles = {
  outerContainer: {
    display: 'flex',
    height: '100%',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerContainer: {
    position: 'relative' as const,
    height: 'calc(100% - 5px)',
    width: 'calc(100% - 5px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: '0.375rem',
    boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    border: '1px solid #e5e5e5',
  },
  innerContainerSelected: {
    outline: '2px solid #3b82f6',
    outlineOffset: '2px',
  },
} as const;

export function RectangleNode({
  selected,
  dragging,
  data,
}: NodeProps<RectangleNodeData>) {
  const {
    color,
    opacity = 60,
    borderColor = '#e5e5e5',
    borderStyle = 'solid',
    borderWidth = 1,
    borderRadius = 6,
    cornerDecoration = 'none',
    cornerDecorationSize = 8,
  } = data;

  const renderCornerDecoration = (position: 'tl' | 'tr' | 'bl' | 'br') => {
    if (cornerDecoration === 'none') return null;

    const positionStyles: Record<string, any> = {
      tl: { top: -cornerDecorationSize / 2, left: -cornerDecorationSize / 2 },
      tr: { top: -cornerDecorationSize / 2, right: -cornerDecorationSize / 2 },
      bl: { bottom: -cornerDecorationSize / 2, left: -cornerDecorationSize / 2 },
      br: { bottom: -cornerDecorationSize / 2, right: -cornerDecorationSize / 2 },
    };

    const isFilled = cornerDecoration === 'square' || cornerDecoration === 'circle';
    const isCircle = cornerDecoration === 'circle' || cornerDecoration === 'circle-outline';

    return (
      <div
        style={{
          position: 'absolute',
          width: `${cornerDecorationSize}px`,
          height: `${cornerDecorationSize}px`,
          backgroundColor: isFilled ? borderColor : 'transparent',
          border: isFilled ? 'none' : `2px solid ${borderColor}`,
          borderRadius: isCircle ? '50%' : '0',
          ...positionStyles[position],
        }}
      />
    );
  };

  return (
    <>
      <NodeResizer isVisible={selected && !dragging} />
      <div style={styles.outerContainer}>
        <div
          style={{
            ...styles.innerContainer,
            backgroundColor: color,
            opacity: opacity / 100,
            borderColor,
            borderStyle,
            borderWidth: `${borderWidth}px`,
            borderRadius: `${borderRadius}px`,
            ...(selected ? styles.innerContainerSelected : {}),
          }}
        >
          {renderCornerDecoration('tl')}
          {renderCornerDecoration('tr')}
          {renderCornerDecoration('bl')}
          {renderCornerDecoration('br')}
        </div>
      </div>
    </>
  );
}
