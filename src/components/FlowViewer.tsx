import { useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Edge,
  type Node,
  type NodeTypes,
  type EdgeTypes,
  BackgroundVariant,
  type ReactFlowInstance,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { CustomNode } from './CustomNode';
import { IconNode } from './IconNode';
import { RectangleNode } from './RectangleNode';
import { ContentNode } from './ContentNode';
import { ImageNode } from './ImageNode';
import { AnimatedEdge } from './AnimatedEdge';

const nodeTypes: NodeTypes = {
  custom: CustomNode,
  icon: IconNode,
  rectangle: RectangleNode,
  content: ContentNode,
  image: ImageNode,
};

const edgeTypes: EdgeTypes = {
  animated: AnimatedEdge,
};

export interface FlowViewerProps {
  flowData: {
    nodes: Node[];
    edges: Edge[];
    viewport?: {
      x: number;
      y: number;
      zoom: number;
    };
    canvasSettings?: {
      showDots?: boolean;
      backgroundColor?: string;
      dotColor?: string;
    };
  };
  config?: {
    showControls?: boolean;
    showMiniMap?: boolean;
    showBackground?: boolean;
    fitView?: boolean;
    interactive?: boolean; // Enable zoom for preview mode
  };
  onInit?: (instance: ReactFlowInstance) => void;
  onMove?: () => void; // Called when viewport changes
}

export function FlowViewer({
  flowData,
  config = {
    showControls: false,
    showMiniMap: false,
    showBackground: true,
    fitView: true,
    interactive: false,
  },
  onInit,
  onMove
}: FlowViewerProps) {
  const isInteractive = config.interactive ?? false;
  const [nodes, setNodes, onNodesChange] = useNodesState(flowData.nodes || []);
  const [edges, setEdges, onEdgesChange] = useEdgesState(flowData.edges || []);

  const canvasSettings = {
    showDots: flowData.canvasSettings?.showDots ?? true,
    backgroundColor: flowData.canvasSettings?.backgroundColor ?? '#ffffff',
    dotColor: flowData.canvasSettings?.dotColor ?? '#cccccc',
  };

  // Update nodes and edges when flowData changes
  useEffect(() => {
    setNodes(flowData.nodes || []);
  }, [flowData.nodes, setNodes]);

  useEffect(() => {
    setEdges(flowData.edges || []);
  }, [flowData.edges, setEdges]);

  return (
    <div className="w-full h-full flow-viewer-readonly">
      <style>{`
        .flow-viewer-readonly .react-flow__handle {
          pointer-events: none !important;
        }
        .flow-viewer-readonly .react-flow__node {
          pointer-events: all !important;
        }
        [data-radix-popper-content-wrapper] {
          z-index: 9999 !important;
        }
      `}</style>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onInit={onInit}
        onMove={onMove}
        defaultViewport={config.fitView ? undefined : flowData.viewport}
        fitView={config.fitView}
        // Read-only configuration
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        // Pan and zoom navigation
        panOnDrag={true}
        panOnScroll={isInteractive}
        zoomOnScroll={isInteractive}
        zoomOnPinch={isInteractive}
        zoomOnDoubleClick={isInteractive}
        preventScrolling={false}
        // Disable interaction features
        selectNodesOnDrag={false}
        // Keep attribution
        attributionPosition="bottom-left"
      >
        {config.showBackground && canvasSettings.showDots ? (
          <Background
            variant={BackgroundVariant.Dots}
            color={canvasSettings.dotColor}
            style={{ backgroundColor: canvasSettings.backgroundColor }}
          />
        ) : config.showBackground ? (
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: canvasSettings.backgroundColor,
            zIndex: 0
          }} />
        ) : null}

        {config.showControls && <Controls showInteractive={false} />}
        {config.showMiniMap && <MiniMap />}
      </ReactFlow>
    </div>
  );
}
