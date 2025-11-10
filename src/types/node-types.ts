export type HandleType = 'source' | 'target' | 'both';

export interface HandleConfig {
  top?: HandleType;
  right?: HandleType;
  bottom?: HandleType;
  left?: HandleType;
  showHandles?: boolean; // Whether to show handles on the node
}

export interface NodeStyle {
  backgroundColor: string;
  backgroundOpacity?: number; // Opacity from 0-100 (0 = transparent, 100 = opaque)
  borderColor: string;
  borderStyle: 'solid' | 'dashed' | 'dotted';
  borderWidth: number;
  textColor?: string;
  borderRadius?: number; // Border radius for corners (0 = square, 8 = rounded, 9999 = circle)
}

export interface IconNodeStyle {
  iconName: string;
  iconSize?: number;
  iconColor: string;
  backgroundColor?: string;
  backgroundOpacity?: number; // Opacity from 0-100 (0 = transparent, 100 = opaque)
  showLabel?: boolean;
  labelPosition?: 'top' | 'bottom';
  labelColor?: string;
  borderColor?: string;
  borderStyle?: 'solid' | 'dashed' | 'dotted';
  borderWidth?: number;
  borderRadius?: number; // Border radius for corners (0 = square, 8 = rounded, 9999 = circle)
}

export interface CustomNodeType {
  id: string;
  name: string;
  type?: 'standard' | 'icon'; // Default is 'standard' for backward compatibility
  style?: NodeStyle; // For standard nodes
  iconStyle?: IconNodeStyle; // For icon nodes
  handles?: HandleConfig; // Handle configuration for all positions
}

const DEFAULT_STANDARD_NODES: CustomNodeType[] = [
  {
    id: 'default',
    name: 'Default',
    type: 'standard',
    style: {
      backgroundColor: '#ffffff',
      borderColor: '#1a192b',
      borderStyle: 'solid',
      borderWidth: 1,
      textColor: '#000000',
      borderRadius: 3,
    },
  },
  {
    id: 'process',
    name: 'Process',
    type: 'standard',
    style: {
      backgroundColor: '#3b82f6',
      borderColor: '#1e40af',
      borderStyle: 'solid',
      borderWidth: 2,
      textColor: '#ffffff',
      borderRadius: 8,
    },
  },
  {
    id: 'decision',
    name: 'Decision',
    type: 'standard',
    style: {
      backgroundColor: '#f59e0b',
      borderColor: '#b45309',
      borderStyle: 'solid',
      borderWidth: 2,
      textColor: '#ffffff',
      borderRadius: 8,
    },
  },
  {
    id: 'data',
    name: 'Data',
    type: 'standard',
    style: {
      backgroundColor: '#10b981',
      borderColor: '#047857',
      borderStyle: 'dashed',
      borderWidth: 2,
      textColor: '#ffffff',
      borderRadius: 3,
    },
  },
  {
    id: 'output',
    name: 'Output',
    type: 'standard',
    style: {
      backgroundColor: '#8b5cf6',
      borderColor: '#6d28d9',
      borderStyle: 'solid',
      borderWidth: 2,
      textColor: '#ffffff',
      borderRadius: 8,
    },
  },
];

const DEFAULT_ICON_NODES: CustomNodeType[] = [
  {
    id: 'icon-database',
    name: 'Database',
    type: 'icon',
    iconStyle: {
      iconName: 'database',
      iconSize: 32,
      iconColor: '#3b82f6',
      backgroundColor: '#eff6ff',
      showLabel: true,
      labelPosition: 'top',
      labelColor: '#1e40af',
      borderColor: '#3b82f6',
      borderStyle: 'solid',
      borderWidth: 2,
      borderRadius: 8,
    },
  },
  {
    id: 'icon-server',
    name: 'Server',
    type: 'icon',
    iconStyle: {
      iconName: 'server',
      iconSize: 32,
      iconColor: '#10b981',
      backgroundColor: '#f0fdf4',
      showLabel: true,
      labelPosition: 'top',
      labelColor: '#047857',
      borderColor: '#10b981',
      borderStyle: 'solid',
      borderWidth: 2,
      borderRadius: 8,
    },
  },
  {
    id: 'icon-cloud',
    name: 'Cloud',
    type: 'icon',
    iconStyle: {
      iconName: 'cloud',
      iconSize: 32,
      iconColor: '#6366f1',
      backgroundColor: '#eef2ff',
      showLabel: true,
      labelPosition: 'top',
      labelColor: '#4338ca',
      borderColor: '#6366f1',
      borderStyle: 'solid',
      borderWidth: 2,
      borderRadius: 8,
    },
  },
  {
    id: 'icon-network',
    name: 'Network',
    type: 'icon',
    iconStyle: {
      iconName: 'network',
      iconSize: 32,
      iconColor: '#8b5cf6',
      backgroundColor: '#faf5ff',
      showLabel: true,
      labelPosition: 'top',
      labelColor: '#6d28d9',
      borderColor: '#8b5cf6',
      borderStyle: 'solid',
      borderWidth: 2,
      borderRadius: 8,
    },
  },
  {
    id: 'icon-lock',
    name: 'Security',
    type: 'icon',
    iconStyle: {
      iconName: 'lock',
      iconSize: 32,
      iconColor: '#ef4444',
      backgroundColor: '#fef2f2',
      showLabel: true,
      labelPosition: 'top',
      labelColor: '#b91c1c',
      borderColor: '#ef4444',
      borderStyle: 'solid',
      borderWidth: 2,
      borderRadius: 8,
    },
  },
];

export const DEFAULT_NODE_TYPES: CustomNodeType[] = [
  ...DEFAULT_STANDARD_NODES,
  ...DEFAULT_ICON_NODES,
];
