import React from 'react';
import { useWorkflow } from '@/hooks/useWorkflow';
import { WorkflowVisualizer } from '../workflow/WorkflowVisualizer';
import { Button } from '../ui/button';
import { Plus, Play, Save } from 'lucide-react';

export function WorkflowPanel() {
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
          <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
            <p className="text-lg font-medium mb-2">No workflows yet</p>
            <p className="text-sm">Create a new workflow to get started</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {workflows.map((workflow) => (
              <div
                key={workflow.id}
                className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm"
              >
                <div className="mb-4">
                  <h3 className="font-medium dark:text-white">
                    {workflow.name || 'Untitled Workflow'}
                  </h3>
                  {workflow.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {workflow.description}
                    </p>
                  )}
                </div>

                <WorkflowVisualizer workflow={workflow} />

                <div className="mt-4 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <span className="text-gray-500 dark:text-gray-400">
                      Created {new Date(workflow.created).toLocaleDateString()}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">
                      {workflow.steps.length} steps
                    </span>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs ${
                    workflow.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                    workflow.status === 'failed' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                    'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                  }`}>
                    {workflow.status.charAt(0).toUpperCase() + workflow.status.slice(1)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}