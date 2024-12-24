import React from 'react';
import { BasePanel } from './panels/BasePanel';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Play, Plus, Save } from 'lucide-react';
import { useWorkflow } from '../hooks/useWorkflow';
import { WorkflowVisualizer } from './workflow/WorkflowVisualizer';

export function AgentWorkflow() {
  const { workflows, createWorkflow } = useWorkflow();
  const activeWorkflow = workflows[0]; // For now, just show the first workflow

  return (
    <BasePanel
      title="Agent Workflow"
      description="Visualize and manage agent workflows"
      headerActions={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            New
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
      }
    >
      {activeWorkflow ? (
        <WorkflowVisualizer workflow={activeWorkflow} />
      ) : (
        <Card className="p-8 text-center">
          <h3 className="text-lg font-medium mb-2">No Active Workflow</h3>
          <p className="text-muted-foreground mb-4">
            Create a new workflow to get started with agent automation
          </p>
          <Button onClick={() => createWorkflow({})}>
            <Plus className="w-4 h-4 mr-2" />
            Create Workflow
          </Button>
        </Card>
      )}
    </BasePanel>
  );
}