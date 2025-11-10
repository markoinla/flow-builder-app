import { BaseEdge, EdgeProps, getStraightPath, getBezierPath, getSmoothStepPath } from '@xyflow/react';
import { useMemo } from 'react';

export function AnimatedEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
}: EdgeProps) {
  const animationDirection = data?.animationDirection || 'forward';
  const animationSpeed = data?.animationSpeed || 1;
  const edgeType = data?.edgeType || 'default';

  // Get the appropriate path based on edge type
  const [edgePath] = useMemo(() => {
    if (edgeType === 'straight') {
      return getStraightPath({ sourceX, sourceY, targetX, targetY });
    } else if (edgeType === 'step' || edgeType === 'smoothstep') {
      return getSmoothStepPath({ sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition });
    } else {
      return getBezierPath({ sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition });
    }
  }, [sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, edgeType]);

  const duration = 2 / animationSpeed;
  const numPulses = 3; // Number of animated circles

  return (
    <g>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      <defs>
        <path id={`edgePath-${id}`} d={edgePath} />
      </defs>
      {Array.from({ length: numPulses }).map((_, i) => {
        const delay = (duration / numPulses) * i;
        return (
          <circle
            key={i}
            r="4"
            fill={style.stroke || '#b1b1b7'}
            opacity="0.6"
          >
            <animateMotion
              dur={`${duration}s`}
              repeatCount="indefinite"
              begin={`${delay}s`}
              keyPoints={animationDirection === 'forward' ? '1;0' : '0;1'}
              keyTimes="0;1"
              calcMode="linear"
            >
              <mpath href={`#edgePath-${id}`} />
            </animateMotion>
            <animate
              attributeName="opacity"
              values="0;0.8;0.8;0"
              keyTimes="0;0.1;0.9;1"
              dur={`${duration}s`}
              repeatCount="indefinite"
              begin={`${delay}s`}
            />
          </circle>
        );
      })}
    </g>
  );
}
