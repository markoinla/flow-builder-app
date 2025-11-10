import { useCallback, useState, useEffect, useRef } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  type Connection,
  type Edge,
  type Node,
  Panel,
  type NodeTypes,
  type EdgeTypes,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { toast } from 'sonner';
import { CustomNode } from './CustomNode';
import { IconNode } from './IconNode';
import { RectangleNode } from './RectangleNode';
import { RectangleTool } from './RectangleTool';
import { AnimatedEdge } from './AnimatedEdge';
import { NodePalette } from './NodePalette';
import { DrawingToolbar } from './DrawingToolbar';
import { RectangleEditDialog } from './NodeContextMenu';
import { EdgeEditDialog, type EdgeStyleData } from './EdgeEditDialog';
import { NodeContextMenu as NodeRightClickMenu } from './NodeContextMenu2';
import { NodeContentDialog } from './NodeContentDialog';
import { NodeTypeEditor, type NodeTypeFormData } from './NodeTypeEditor';
import { type IconName } from './ui/icon-picker';
import { DEFAULT_NODE_TYPES, type CustomNodeType, type HandleConfig } from '../types/node-types';
import { nodeTypesApi, flowsApi } from '../lib/api';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import {
  HandIcon,
  MousePointer2,
  Move,
  Cable,
  Trash2,
  MousePointerClick,
  Save,
  Eraser
} from 'lucide-react';

const nodeTypes: NodeTypes = {
  custom: CustomNode,
  icon: IconNode,
  rectangle: RectangleNode,
};

const edgeTypes: EdgeTypes = {
  animated: AnimatedEdge,
};

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

interface FlowBuilderProps {
  onSave?: (nodes: Node[], edges: Edge[]) => void;
  flowId?: string;
}

export function FlowBuilder({ onSave, flowId: initialFlowId }: FlowBuilderProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [flowName, setFlowName] = useState('Untitled Flow');
  const [flowDescription, setFlowDescription] = useState('');
  const [flowId, setFlowId] = useState<string | null>(null);
  const [customNodeTypes, setCustomNodeTypes] = useState<CustomNodeType[]>(DEFAULT_NODE_TYPES);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [nodeTypeToDelete, setNodeTypeToDelete] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Rectangle drawing state
  const [isRectangleActive, setIsRectangleActive] = useState(false);

  // Rectangle edit dialog state
  const [showRectangleDialog, setShowRectangleDialog] = useState(false);
  const [selectedRectangle, setSelectedRectangle] = useState<Node | null>(null);

  // Edge edit dialog state
  const [showEdgeDialog, setShowEdgeDialog] = useState(false);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);

  // Node context menu state
  const [nodeContextMenu, setNodeContextMenu] = useState<{
    id: string;
    top: number;
    left: number;
  } | null>(null);

  // Node content dialog state
  const [showNodeContentDialog, setShowNodeContentDialog] = useState(false);
  const [selectedContentNode, setSelectedContentNode] = useState<Node | null>(null);

  // Node type editor state (for editing node properties)
  const [showNodeTypeEditor, setShowNodeTypeEditor] = useState(false);
  const [editingNodeTypeId, setEditingNodeTypeId] = useState<string | null>(null);
  const [nodeTypeFormData, setNodeTypeFormData] = useState<NodeTypeFormData>({
    name: '',
    nodeTypeCategory: 'standard',
    backgroundColor: '#ffffff',
    backgroundOpacity: 100,
    borderColor: '#1a192b',
    borderStyle: 'solid',
    borderWidth: 1,
    textColor: '#000000',
    borderRadius: 3,
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
    handles: { top: 'both', bottom: 'both' } as HandleConfig,
  });

  // Load node types from D1 on mount
  useEffect(() => {
    async function loadNodeTypes() {
      try {
        setIsLoading(true);
        const nodeTypes = await nodeTypesApi.getAll();
        if (nodeTypes.length > 0) {
          setCustomNodeTypes(nodeTypes);
        } else {
          // If no node types exist, create the defaults
          for (const defaultType of DEFAULT_NODE_TYPES) {
            await nodeTypesApi.create(defaultType);
          }
          setCustomNodeTypes(DEFAULT_NODE_TYPES);
        }
      } catch (err) {
        console.error('Failed to load node types:', err);
        setError('Failed to load node types');
        // Fall back to default node types
        setCustomNodeTypes(DEFAULT_NODE_TYPES);
      } finally {
        setIsLoading(false);
      }
    }

    loadNodeTypes();
  }, []);

  // Migrate edge animations from old inverted keyframes
  const migrateEdgeAnimations = useCallback((edges: Edge[]) => {
    return edges.map((edge) => {
      // If edge has animation in style but no animationDirection in data, it's likely old data
      if (edge.style?.animation && !edge.data?.animationDirection) {
        const animation = edge.style.animation;
        // Old 'dashdraw' was actually backward, old 'dashdraw-reverse' was actually forward
        // Now they're fixed, so we need to swap the stored direction
        if (animation.includes('dashdraw-reverse')) {
          return {
            ...edge,
            data: {
              ...edge.data,
              animationDirection: 'forward', // Old reverse is now forward
            },
          };
        } else if (animation.includes('dashdraw')) {
          return {
            ...edge,
            data: {
              ...edge.data,
              animationDirection: 'backward', // Old forward is now backward
            },
          };
        }
      }
      return edge;
    });
  }, []);

  // Load flow from API or localStorage
  useEffect(() => {
    async function loadFlow() {
      // If flowId is provided via prop, load from API
      if (initialFlowId) {
        try {
          const { flow, flowData } = await flowsApi.get(initialFlowId);

          if (flowData) {
            setNodes(flowData.nodes || []);
            // Migrate old animation directions
            setEdges(migrateEdgeAnimations(flowData.edges || []));
            setFlowName(flow.name);
            setFlowDescription(flow.description || '');
            setFlowId(flow.id);
          }
        } catch (error) {
          console.error('Failed to load flow from API:', error);
          setError('Failed to load workflow');
        }
        return;
      }

      // Otherwise, try to load from localStorage (legacy support)
      if (typeof window !== 'undefined') {
        const savedFlow = localStorage.getItem('currentFlow');
        if (savedFlow) {
          try {
            const { nodes: savedNodes, edges: savedEdges, flowId: savedFlowId } = JSON.parse(savedFlow);
            if (savedNodes && savedEdges) {
              setNodes(savedNodes);
              // Migrate old animation directions
              setEdges(migrateEdgeAnimations(savedEdges));
              setFlowId(savedFlowId || null);
            }
          } catch (error) {
            console.error('Failed to load saved flow from localStorage:', error);
          }
        }
      }
    }

    loadFlow();
  }, [initialFlowId, setNodes, setEdges, migrateEdgeAnimations]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: Node) => {
      // Prevent default context menu
      event.preventDefault();

      // Handle rectangle nodes with dialog
      if (node.type === 'rectangle') {
        setSelectedRectangle(node);
        setShowRectangleDialog(true);
        return;
      }

      // Handle custom and icon nodes with context menu
      if (node.type === 'custom' || node.type === 'icon') {
        // Use viewport coordinates for fixed positioning
        setNodeContextMenu({
          id: node.id,
          top: event.clientY,
          left: event.clientX,
        });
      }
    },
    []
  );

  const handleUpdateRectangle = useCallback((nodeId: string, data: any) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, ...data } }
          : node
      )
    );
  }, [setNodes]);

  const handleDeleteRectangle = useCallback((nodeId: string) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
  }, [setNodes, setEdges]);

  const onEdgeContextMenu = useCallback(
    (event: React.MouseEvent, edge: Edge) => {
      // Prevent default context menu
      event.preventDefault();

      // Open edit dialog
      setSelectedEdge(edge);
      setShowEdgeDialog(true);
    },
    []
  );

  const handleUpdateEdge = useCallback((edgeId: string, data: EdgeStyleData) => {
    setEdges((eds) =>
      eds.map((edge) =>
        edge.id === edgeId
          ? {
              ...edge,
              animated: data.animated,
              type: data.type,
              style: {
                ...edge.style,
                stroke: data.stroke,
                strokeWidth: data.strokeWidth,
                strokeDasharray: data.style?.strokeDasharray,
                animation: data.style?.animation,
              },
              data: {
                ...edge.data,
                animationDirection: data.animationDirection,
                animationSpeed: data.animationSpeed,
                edgeType: data.edgeType,
              },
            }
          : edge
      )
    );
  }, [setEdges]);

  const handleDeleteEdge = useCallback((edgeId: string) => {
    setEdges((eds) => eds.filter((edge) => edge.id !== edgeId));
  }, [setEdges]);

  // Node context menu handlers
  const handleEditNode = useCallback((nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) {
      console.error('Node not found:', nodeId);
      return;
    }

    const sourceNodeTypeId = node.data?.sourceNodeTypeId;
    if (!sourceNodeTypeId) {
      console.error('Node does not have a sourceNodeTypeId:', node);
      setError('This node cannot be edited - it does not have a node type.');
      return;
    }

    const nodeType = customNodeTypes.find(nt => nt.id === sourceNodeTypeId);
    if (!nodeType) {
      console.error('Node type not found for ID:', sourceNodeTypeId);
      setError('Node type not found. It may have been deleted.');
      return;
    }

    setEditingNodeTypeId(nodeType.id);

    // Populate form data based on node type (icon or standard)
    if (nodeType.type === 'icon' && nodeType.iconStyle) {
      setNodeTypeFormData({
        name: nodeType.name,
        nodeTypeCategory: 'icon',
        backgroundColor: '',
        backgroundOpacity: 100,
        borderColor: '#1a192b',
        borderStyle: 'solid',
        borderWidth: 1,
        textColor: '#000000',
        borderRadius: 3,
        iconName: nodeType.iconStyle.iconName as IconName,
        iconSize: nodeType.iconStyle.iconSize,
        iconColor: nodeType.iconStyle.iconColor,
        iconBackgroundColor: nodeType.iconStyle.backgroundColor || '',
        iconBackgroundOpacity: nodeType.iconStyle.backgroundOpacity || 100,
        showLabel: nodeType.iconStyle.showLabel ?? true,
        labelPosition: nodeType.iconStyle.labelPosition || 'bottom',
        labelColor: nodeType.iconStyle.labelColor || '#000000',
        iconBorderColor: nodeType.iconStyle.borderColor || '#1a192b',
        iconBorderStyle: nodeType.iconStyle.borderStyle || 'solid',
        iconBorderWidth: nodeType.iconStyle.borderWidth ?? 0,
        iconBorderRadius: nodeType.iconStyle.borderRadius ?? 8,
        handles: nodeType.handles || { top: 'both', bottom: 'both' },
      });
      setShowNodeTypeEditor(true);
    } else if (nodeType.style) {
      setNodeTypeFormData({
        name: nodeType.name,
        nodeTypeCategory: 'standard',
        backgroundColor: nodeType.style.backgroundColor,
        backgroundOpacity: nodeType.style.backgroundOpacity ?? 100,
        borderColor: nodeType.style.borderColor,
        borderStyle: nodeType.style.borderStyle,
        borderWidth: nodeType.style.borderWidth,
        textColor: nodeType.style.textColor || '#000000',
        borderRadius: nodeType.style.borderRadius ?? 3,
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
        handles: nodeType.handles || { top: 'both', bottom: 'both' },
      });
      setShowNodeTypeEditor(true);
    } else {
      console.error('Node type has invalid format:', nodeType);
      setError('This node type has an invalid format and cannot be edited.');
    }
  }, [nodes, customNodeTypes]);

  const handleEditNodeContent = useCallback((nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (node) {
      setSelectedContentNode(node);
      setShowNodeContentDialog(true);
    }
  }, [nodes]);

  const handleDuplicateNode = useCallback((nodeId: string) => {
    const nodeToDuplicate = nodes.find(n => n.id === nodeId);
    if (!nodeToDuplicate) return;

    const newNode = {
      ...nodeToDuplicate,
      id: `${nodeToDuplicate.id}-copy-${Date.now()}`,
      position: {
        x: nodeToDuplicate.position.x + 50,
        y: nodeToDuplicate.position.y + 50,
      },
      selected: false,
    };

    setNodes((nds) => [...nds, newNode]);
  }, [nodes, setNodes]);

  const handleUpdateNode = useCallback((nodeId: string, updates: { label?: string; content?: string }) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, ...updates } }
          : node
      )
    );
  }, [setNodes]);

  const handleDeleteNode = useCallback((nodeId: string) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
  }, [setNodes, setEdges]);

  const handleSave = useCallback(async () => {
    try {
      const savedFlowId = await flowsApi.save(flowId, flowName, flowDescription, nodes, edges);
      setFlowId(savedFlowId);

      // Also save to localStorage as backup
      localStorage.setItem('currentFlow', JSON.stringify({
        nodes,
        edges,
        flowId: savedFlowId,
      }));

      toast.success('Workflow saved to database successfully!');

      if (onSave) {
        onSave(nodes, edges);
      }
    } catch (err) {
      console.error('Failed to save flow:', err);
      setError('Failed to save flow');
      toast.error('Failed to save workflow');
    }
  }, [flowId, flowName, flowDescription, nodes, edges, onSave]);

  const handleClear = useCallback(() => {
    setShowClearDialog(true);
  }, []);

  const confirmClear = useCallback(async () => {
    try {
      // Delete the flow from D1 if it exists
      if (flowId) {
        await flowsApi.delete(flowId);
      }

      setNodes([]);
      setEdges([]);
      setFlowId(null);
      setFlowName('Untitled Flow');
      setFlowDescription('');
      localStorage.removeItem('currentFlow');
      setShowClearDialog(false);
    } catch (err) {
      console.error('Failed to clear flow:', err);
      setError('Failed to clear flow');
    }
  }, [flowId, setNodes, setEdges]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const nodeTypeData = event.dataTransfer.getData('application/reactflow');
      if (!nodeTypeData || !reactFlowInstance) {
        return;
      }

      const nodeType: CustomNodeType = JSON.parse(nodeTypeData);
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      let newNode: Node;

      // Handle different node types
      if (nodeType.type === 'icon' && nodeType.iconStyle) {
        newNode = {
          id: `${nodeType.id}_${Date.now()}`,
          type: 'icon',
          position,
          data: {
            sourceNodeTypeId: nodeType.id, // Track which node type created this node
            iconName: nodeType.iconStyle.iconName,
            iconSize: nodeType.iconStyle.iconSize,
            iconColor: nodeType.iconStyle.iconColor,
            backgroundColor: nodeType.iconStyle.backgroundColor,
            backgroundOpacity: nodeType.iconStyle.backgroundOpacity,
            label: nodeType.name,
            showLabel: nodeType.iconStyle.showLabel,
            labelPosition: nodeType.iconStyle.labelPosition,
            labelColor: nodeType.iconStyle.labelColor,
            borderColor: nodeType.iconStyle.borderColor,
            borderStyle: nodeType.iconStyle.borderStyle,
            borderWidth: nodeType.iconStyle.borderWidth,
            borderRadius: nodeType.iconStyle.borderRadius,
            handles: nodeType.handles || { top: 'both', bottom: 'both' },
          },
          zIndex: 10, // Icon nodes appear above rectangles
        };
      } else {
        // Standard/custom node (backward compatible)
        newNode = {
          id: `${nodeType.id}_${Date.now()}`,
          type: 'custom',
          position,
          data: {
            sourceNodeTypeId: nodeType.id, // Track which node type created this node
            label: nodeType.name,
            style: nodeType.style,
            handles: nodeType.handles || { top: 'both', bottom: 'both' },
          },
          zIndex: 0, // Standard nodes at default layer
        };
      }

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes]
  );

  const onDragStart = useCallback((event: React.DragEvent, nodeType: CustomNodeType) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify(nodeType));
    event.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleAddNodeType = useCallback(async (nodeType: CustomNodeType) => {
    try {
      await nodeTypesApi.create(nodeType);
      setCustomNodeTypes((prev) => [...prev, nodeType]);
    } catch (err) {
      console.error('Failed to create node type:', err);
      setError('Failed to create node type');
    }
  }, []);

  const handleEditNodeType = useCallback(async (id: string, nodeType: CustomNodeType) => {
    try {
      // Update in D1
      await nodeTypesApi.update(id, nodeType);

      // Update the node type locally
      setCustomNodeTypes((prev) => prev.map((nt) => (nt.id === id ? nodeType : nt)));

      // Update all nodes on the canvas that were created from this node type
      setNodes((currentNodes) =>
        currentNodes.map((node) => {
          // Only update nodes that match this source node type
          if (node.data.sourceNodeTypeId !== id) {
            return node;
          }

          // Update based on node type (icon or standard)
          if (nodeType.type === 'icon' && nodeType.iconStyle) {
            return {
              ...node,
              data: {
                ...node.data,
                iconName: nodeType.iconStyle.iconName,
                iconSize: nodeType.iconStyle.iconSize,
                iconColor: nodeType.iconStyle.iconColor,
                backgroundColor: nodeType.iconStyle.backgroundColor,
                backgroundOpacity: nodeType.iconStyle.backgroundOpacity,
                label: nodeType.name,
                showLabel: nodeType.iconStyle.showLabel,
                labelPosition: nodeType.iconStyle.labelPosition,
                labelColor: nodeType.iconStyle.labelColor,
                borderColor: nodeType.iconStyle.borderColor,
                borderStyle: nodeType.iconStyle.borderStyle,
                borderWidth: nodeType.iconStyle.borderWidth,
                borderRadius: nodeType.iconStyle.borderRadius,
                handles: nodeType.handles || { top: 'both', bottom: 'both' },
              },
            };
          } else if (nodeType.style) {
            // Standard node
            return {
              ...node,
              data: {
                ...node.data,
                label: nodeType.name,
                style: nodeType.style,
                handles: nodeType.handles || { top: 'both', bottom: 'both' },
              },
            };
          }

          return node;
        })
      );
    } catch (err) {
      console.error('Failed to update node type:', err);
      setError('Failed to update node type');
    }
  }, [setNodes]);

  const handleDeleteNodeType = useCallback((id: string) => {
    setNodeTypeToDelete(id);
    setShowDeleteDialog(true);
  }, []);

  const confirmDeleteNodeType = useCallback(async () => {
    if (nodeTypeToDelete) {
      try {
        await nodeTypesApi.delete(nodeTypeToDelete);
        setCustomNodeTypes((prev) => prev.filter((nt) => nt.id !== nodeTypeToDelete));
        setNodeTypeToDelete(null);
      } catch (err) {
        console.error('Failed to delete node type:', err);
        setError('Failed to delete node type');
      }
    }
    setShowDeleteDialog(false);
  }, [nodeTypeToDelete]);

  const handleSaveNodeTypeFromEditor = useCallback(async (nodeType: CustomNodeType) => {
    if (editingNodeTypeId) {
      await handleEditNodeType(editingNodeTypeId, nodeType);
      setShowNodeTypeEditor(false);
      setEditingNodeTypeId(null);
    }
  }, [editingNodeTypeId, handleEditNodeType]);

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-semibold">Loading...</div>
          <div className="text-sm text-muted-foreground">Loading node types and flow data</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex">
      {/* Error Display */}
      {error && (
        <div className="fixed top-4 right-4 bg-destructive text-destructive-foreground px-4 py-2 rounded-md shadow-lg z-50">
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-4 text-sm underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Node Palette Sidebar */}
      <NodePalette
        nodeTypes={customNodeTypes}
        onAddNodeType={handleAddNodeType}
        onEditNodeType={handleEditNodeType}
        onDeleteNodeType={handleDeleteNodeType}
        onDragStart={onDragStart}
      />

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="border-b bg-background p-4 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <div className="flex flex-col gap-2 flex-1 max-w-md">
                <Input
                  type="text"
                  value={flowName}
                  onChange={(e) => setFlowName(e.target.value)}
                  placeholder="Flow name"
                  className="w-full"
                />
                <Textarea
                  value={flowDescription}
                  onChange={(e) => setFlowDescription(e.target.value)}
                  placeholder="Flow description (optional)"
                  className="w-full resize-none"
                  rows={2}
                />
              </div>
              <DrawingToolbar
                isRectangleActive={isRectangleActive}
                onToggle={setIsRectangleActive}
              />
              <Button
                onClick={handleClear}
                variant="outline"
              >
                <Eraser className="h-4 w-4 mr-2" />
                Clear Canvas
              </Button>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {nodes.length} nodes, {edges.length} edges
              </span>
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Save Flow
              </Button>
            </div>
          </div>
        </div>

        {/* Flow Canvas */}
        <div className="flex-1" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onNodeContextMenu={onNodeContextMenu}
            onEdgeContextMenu={onEdgeContextMenu}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
            attributionPosition="bottom-left"
          >
            <Background />
            <Controls />
            <MiniMap />

            {isRectangleActive && <RectangleTool onComplete={() => setIsRectangleActive(false)} />}
            <Panel position="top-right" className="bg-card border rounded-lg shadow-lg p-4">
              <div className="text-sm">
                <p className="font-semibold mb-2">Instructions:</p>
                <ul className="space-y-2 text-xs text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <HandIcon className="h-3 w-3 flex-shrink-0" />
                    <span>Drag node types from the left palette</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <MousePointerClick className="h-3 w-3 flex-shrink-0" />
                    <span>Drop them onto the canvas</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Move className="h-3 w-3 flex-shrink-0" />
                    <span>Click and drag nodes to move them</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Cable className="h-3 w-3 flex-shrink-0" />
                    <span>Drag from handles to create connections</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Trash2 className="h-3 w-3 flex-shrink-0" />
                    <span>Select and press Delete to remove</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <MousePointer2 className="h-3 w-3 flex-shrink-0" />
                    <span>Mouse wheel to zoom, drag to pan</span>
                  </li>
                </ul>
              </div>
            </Panel>
          </ReactFlow>
        </div>
      </div>

      {/* Clear Canvas Alert Dialog */}
      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear Canvas</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to clear the canvas? This action cannot be undone and will remove all nodes and edges.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmClear}>Clear Canvas</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Node Type Alert Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Node Type</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this node type? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setNodeTypeToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteNodeType}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Rectangle Edit Dialog */}
      <RectangleEditDialog
        open={showRectangleDialog}
        node={selectedRectangle}
        onClose={() => setShowRectangleDialog(false)}
        onUpdateNode={handleUpdateRectangle}
        onDeleteNode={handleDeleteRectangle}
      />

      {/* Edge Edit Dialog */}
      <EdgeEditDialog
        open={showEdgeDialog}
        edge={selectedEdge}
        onClose={() => setShowEdgeDialog(false)}
        onUpdateEdge={handleUpdateEdge}
        onDeleteEdge={handleDeleteEdge}
      />

      {/* Node Context Menu */}
      {nodeContextMenu && (
        <NodeRightClickMenu
          id={nodeContextMenu.id}
          top={nodeContextMenu.top}
          left={nodeContextMenu.left}
          onEdit={handleEditNode}
          onEditContent={handleEditNodeContent}
          onDuplicate={handleDuplicateNode}
          onDelete={handleDeleteNode}
          onClose={() => setNodeContextMenu(null)}
        />
      )}

      {/* Node Type Editor (for editing node properties) */}
      {showNodeTypeEditor && editingNodeTypeId && (
        <NodeTypeEditor
          open={showNodeTypeEditor}
          onOpenChange={(open) => {
            setShowNodeTypeEditor(open);
            if (!open) {
              setEditingNodeTypeId(null);
            }
          }}
          editingId={editingNodeTypeId}
          initialData={nodeTypeFormData}
          onSave={handleSaveNodeTypeFromEditor}
        />
      )}

      {/* Node Content Dialog */}
      <NodeContentDialog
        open={showNodeContentDialog}
        node={selectedContentNode}
        onClose={() => setShowNodeContentDialog(false)}
        onUpdateNode={handleUpdateNode}
      />
    </div>
  );
}
