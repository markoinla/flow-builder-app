import { createFileRoute } from '@tanstack/react-router';
import { FlowBuilder } from '../../components/FlowBuilder';
import { z } from 'zod';

const builderSearchSchema = z.object({
  flowId: z.string().optional(),
});

export const Route = createFileRoute('/builder/')({
  component: BuilderPage,
  validateSearch: builderSearchSchema,
});

function BuilderPage() {
  const { flowId } = Route.useSearch();

  return (
    <div className="h-screen flex flex-col">
      <FlowBuilder flowId={flowId} />
    </div>
  );
}
