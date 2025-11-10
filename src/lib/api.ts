/**
 * API Client for Flow Builder
 * Provides methods to interact with the D1-backed API endpoints
 */

import type { CustomNodeType } from '../types/node-types';
import type { Node, Edge } from '@xyflow/react';

// Node Types API
export const nodeTypesApi = {
  // Get all node types for the current user
  async getAll(): Promise<CustomNodeType[]> {
    const response = await fetch('/api/node-types');
    if (!response.ok) {
      throw new Error('Failed to fetch node types');
    }
    return response.json();
  },

  // Create a new node type
  async create(nodeType: CustomNodeType): Promise<CustomNodeType> {
    const response = await fetch('/api/node-types', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nodeType),
    });
    if (!response.ok) {
      throw new Error('Failed to create node type');
    }
    return response.json();
  },

  // Update an existing node type
  async update(id: string, nodeType: CustomNodeType): Promise<CustomNodeType> {
    const response = await fetch(`/api/node-types/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nodeType),
    });
    if (!response.ok) {
      throw new Error('Failed to update node type');
    }
    return response.json();
  },

  // Delete a node type
  async delete(id: string): Promise<void> {
    const response = await fetch(`/api/node-types/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete node type');
    }
  },
};

// Flows API
export const flowsApi = {
  // Get all flows for the current user
  async getAll(): Promise<any[]> {
    const response = await fetch('/api/flows');
    if (!response.ok) {
      throw new Error('Failed to fetch flows');
    }
    return response.json();
  },

  // Get a specific flow with its data
  async get(id: string): Promise<{ flow: any; flowData: any }> {
    const response = await fetch(`/api/flows/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch flow');
    }
    return response.json();
  },

  // Create a new flow
  async create(data: {
    name: string;
    description?: string;
    nodes?: Node[];
    edges?: Edge[];
    viewport?: any;
  }): Promise<{ flow: any; flowData: any }> {
    const response = await fetch('/api/flows', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to create flow');
    }
    return response.json();
  },

  // Update a flow
  async update(
    id: string,
    data: {
      name?: string;
      description?: string;
      nodes?: Node[];
      edges?: Edge[];
      viewport?: any;
    }
  ): Promise<void> {
    const response = await fetch(`/api/flows/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to update flow');
    }
  },

  // Delete a flow
  async delete(id: string): Promise<void> {
    const response = await fetch(`/api/flows/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete flow');
    }
  },

  // Save current flow (auto-save functionality)
  async save(
    flowId: string | null,
    flowName: string,
    flowDescription: string,
    nodes: Node[],
    edges: Edge[]
  ): Promise<string> {
    if (flowId) {
      // Update existing flow
      await flowsApi.update(flowId, { name: flowName, description: flowDescription, nodes, edges });
      return flowId;
    } else {
      // Create new flow
      const { flow } = await flowsApi.create({ name: flowName, description: flowDescription, nodes, edges });
      return flow.id;
    }
  },
};
