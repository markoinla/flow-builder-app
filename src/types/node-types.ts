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
  fontFamily?: string; // Google font family (for content nodes)
  fontSize?: number; // Base font size in pixels (for content nodes)
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

export interface ImageNodeStyle {
  imageUrl?: string;
  imageSize?: number; // Size as percentage (0-100)
  opacity?: number; // Opacity from 0-100 (0 = transparent, 100 = opaque)
  backgroundColor?: string;
  backgroundOpacity?: number; // Opacity from 0-100 (0 = transparent, 100 = opaque)
  borderColor?: string;
  borderStyle?: 'solid' | 'dashed' | 'dotted';
  borderWidth?: number;
  borderRadius?: number; // Border radius for corners (0 = square, 8 = rounded, 9999 = circle)
}

export interface CustomNodeType {
  id: string;
  name: string;
  type?: 'standard' | 'icon' | 'content' | 'image'; // Default is 'standard' for backward compatibility
  style?: NodeStyle; // For standard/content nodes
  iconStyle?: IconNodeStyle; // For icon nodes
  imageStyle?: ImageNodeStyle; // For image nodes
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
];

const DEFAULT_CONTENT_NODES: CustomNodeType[] = [
  {
    id: 'content-note',
    name: 'Content Note',
    type: 'content',
    style: {
      backgroundColor: '#fef3c7',
      backgroundOpacity: 100,
      borderColor: '#f59e0b',
      borderStyle: 'solid',
      borderWidth: 2,
      textColor: '#78350f',
      borderRadius: 8,
    },
  },
];

const DEFAULT_ICON_NODES: CustomNodeType[] = [
  {
    id: 'icon-database',
    name: 'Icon Node',
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
];

const DEFAULT_IMAGE_NODES: CustomNodeType[] = [
  {
    id: 'image-default',
    name: 'Image Node',
    type: 'image',
    imageStyle: {
      imageSize: 100,
      opacity: 100,
      backgroundColor: '#ffffff',
      backgroundOpacity: 100,
      borderColor: '#e5e5e5',
      borderStyle: 'solid',
      borderWidth: 1,
      borderRadius: 4,
    },
  },
];

export const DEFAULT_NODE_TYPES: CustomNodeType[] = [
  ...DEFAULT_STANDARD_NODES,
  ...DEFAULT_CONTENT_NODES,
  ...DEFAULT_ICON_NODES,
  ...DEFAULT_IMAGE_NODES,
];
