import React from 'react';
import { useWorkflow } from '../../hooks/useWorkflow';
import { WorkflowVisualizer } from '../workflow/WorkflowVisualizer';
import { Button } from '../ui/button';
import { Plus, Play, Save } from 'lucide-react';

export default function WorkflowPanel() {
  const { workflows } = useWorkflow();

  return (
    <div className="h-full flex flex-col p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold dark:text-white">Workflows</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            New Workflow
          </Button>
          <Button variant="outline" size="sm">
            <Play className="w-4 h-4 mr-2" />
            Run
          </Button>
          <Button variant="outline" size="sm">
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {workflows.length === 0 ? (
          <div className="h-full flex flex-col items-start justify-center p-8 text-left">
            <h3 className="text-xl font-semibold mb-2 dark:text-white">No workflows yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Create your first workflow to automate your tasks.
            </p>
            <Button onClick={() => {}}>
              <Plus className="w-4 h-4 mr-2" />
              Create Workflow
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {workflows.map((workflow) => (
              <WorkflowVisualizer key={workflow.id} workflow={workflow} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}