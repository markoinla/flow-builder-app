import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { Plus, FileText, Trash2, Clock, Edit, LogIn } from 'lucide-react';
import { flowsApi } from '../../lib/api';
import { Button } from '../../components/ui/button';
import { useSession } from '../../lib/auth-client';

export const Route = createFileRoute('/flows/')({
  component: FlowsList,
});

interface Flow {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

function FlowsList() {
  const navigate = useNavigate();
  const { data: session, isPending } = useSession();
  const [flows, setFlows] = useState<Flow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isPending && session?.user) {
      loadFlows();
    } else if (!isPending && !session?.user) {
      setLoading(false);
    }
  }, [session, isPending]);

  const loadFlows = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await flowsApi.getAll();
      setFlows(data);
    } catch (err) {
      console.error('Failed to load flows:', err);
      setError('Failed to load workflows. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (flowId: string, flowName: string) => {
    if (!confirm(`Are you sure you want to delete "${flowName}"?`)) {
      return;
    }

    try {
      await flowsApi.delete(flowId);
      setFlows((prev) => prev.filter((f) => f.id !== flowId));
    } catch (err) {
      console.error('Failed to delete flow:', err);
      alert('Failed to delete workflow. Please try again.');
    }
  };

  const handleCreateNew = async () => {
    try {
      const newFlow = await flowsApi.create({
        name: 'Untitled Flow',
        description: '',
        nodes: [],
        edges: [],
        viewport: { x: 0, y: 0, zoom: 1 },
      });
      navigate({ to: '/builder', search: { flowId: newFlow.flow.id } });
    } catch (err) {
      console.error('Failed to create flow:', err);
      alert('Failed to create new workflow. Please try again.');
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Show login prompt if not authenticated
  if (!isPending && !session?.user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <LogIn className="h-16 w-16 text-cyan-400 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-white mb-4">Login Required</h1>
          <p className="text-gray-400 mb-8">
            Please log in to view and manage your workflows.
          </p>
          <div className="flex flex-col gap-4">
            <Link
              to="/auth/login"
              className="px-8 py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-lg transition-colors shadow-lg shadow-cyan-500/50"
            >
              Log In
            </Link>
            <Link
              to="/auth/signup"
              className="px-8 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">My Workflows</h1>
            <p className="text-gray-400">
              Create and manage your flow diagrams
            </p>
          </div>
          <Button
            onClick={handleCreateNew}
            className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 shadow-lg shadow-cyan-500/50"
          >
            <Plus className="h-5 w-5" />
            New Workflow
          </Button>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-4 mb-6">
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {(loading || isPending) && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !isPending && flows.length === 0 && !error && (
          <div className="text-center py-20">
            <FileText className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-300 mb-2">
              No workflows yet
            </h2>
            <p className="text-gray-500 mb-6">
              Create your first workflow to get started
            </p>
            <Button
              onClick={handleCreateNew}
              className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-3 rounded-lg font-semibold inline-flex items-center gap-2"
            >
              <Plus className="h-5 w-5" />
              Create Your First Workflow
            </Button>
          </div>
        )}

        {/* Flows Grid */}
        {!loading && !isPending && flows.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {flows.map((flow) => (
              <div
                key={flow.id}
                className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10 group"
              >
                {/* Flow Info */}
                <div className="mb-4">
                  <h3 className="text-xl font-semibold text-white mb-2 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-cyan-400" />
                    {flow.name}
                  </h3>
                  {flow.description && (
                    <p className="text-gray-400 text-sm line-clamp-2">
                      {flow.description}
                    </p>
                  )}
                </div>

                {/* Timestamps */}
                <div className="flex flex-col gap-1 mb-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Created: {formatDate(flow.createdAt)}
                  </div>
                  {flow.updatedAt !== flow.createdAt && (
                    <div className="flex items-center gap-1">
                      <Edit className="h-3 w-3" />
                      Updated: {formatDate(flow.updatedAt)}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Link
                    to="/builder"
                    search={{ flowId: flow.id }}
                    className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg font-medium text-center transition-colors"
                  >
                    Open
                  </Link>
                  <button
                    onClick={() => handleDelete(flow.id, flow.name)}
                    className="bg-red-600/20 hover:bg-red-600/30 text-red-400 px-4 py-2 rounded-lg transition-colors"
                    title="Delete workflow"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
