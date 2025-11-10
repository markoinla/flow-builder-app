/**
 * Edge settings storage utilities
 * Manages saving and loading default edge settings from local storage
 */

export interface EdgeSettings {
  stroke: string;
  strokeWidth: number;
  animated: boolean;
  lineStyle: 'solid' | 'dashed' | 'dotted';
  type: 'default' | 'straight' | 'step' | 'smoothstep';
  animationDirection: 'forward' | 'backward';
  animationSpeed: number;
}

const STORAGE_KEY = 'flow-builder-edge-settings';

const DEFAULT_EDGE_SETTINGS: EdgeSettings = {
  stroke: '#b1b1b7',
  strokeWidth: 2,
  animated: false,
  lineStyle: 'solid',
  type: 'default',
  animationDirection: 'forward',
  animationSpeed: 1,
};

/**
 * Save edge settings to local storage
 */
export function saveEdgeSettings(settings: EdgeSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save edge settings to local storage:', error);
  }
}

/**
 * Load edge settings from local storage
 * Returns default settings if nothing is saved
 */
export function loadEdgeSettings(): EdgeSettings {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Merge with defaults to handle missing properties
      return { ...DEFAULT_EDGE_SETTINGS, ...parsed };
    }
  } catch (error) {
    console.error('Failed to load edge settings from local storage:', error);
  }
  return DEFAULT_EDGE_SETTINGS;
}

/**
 * Clear saved edge settings from local storage
 */
export function clearEdgeSettings(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear edge settings from local storage:', error);
  }
}

/**
 * Get default edge settings
 */
export function getDefaultEdgeSettings(): EdgeSettings {
  return DEFAULT_EDGE_SETTINGS;
}
