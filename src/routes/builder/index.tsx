import { createFileRoute } from '@tanstack/react-router';
import { FlowBuilder } from '../../components/FlowBuilder';
import type { Node, Edge } from '@xyflow/react';
import { toast } from 'sonner';

export const Route = createFileRoute('/builder/')({
  component: BuilderPage,
});

function BuilderPage() {
  const handleSave = (nodes: Node[], edges: Edge[]) => {
    console.log('Saving flow:', { nodes, edges });

    // Save to localStorage for now
    const flowData = {
      nodes,
      edges,
      savedAt: new Date().toISOString()
    };

    localStorage.setItem('currentFlow', JSON.stringify(flowData));
    toast.success('Flow saved to browser storage!');
  };

  return (
    <div className="h-screen flex flex-col">
      <FlowBuilder onSave={handleSave} />
    </div>
  );
}
