import React, { useState } from 'react'
import { Card } from './ui/card'
import { Button } from './ui/button'
import { Plus, Play, Save, Settings } from 'lucide-react'
import { useWorkflow, type Workflow } from '../hooks/useWorkflow'
import { WorkflowVisualizer } from './workflow/WorkflowVisualizer'
import { WorkflowDialog } from './workflow/WorkflowDialog'

export function AgentWorkflow() {
  const { workflows, createWorkflow, runWorkflow, saveWorkflow } = useWorkflow()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const activeWorkflow = workflows[0] // For now, just show the first workflow

  const handleCreateWorkflow = (workflowData: {
    name: string
    description: string
    steps: Array<{
      id: string
      name: string
      agent?: string
      description?: string
    }>
  }) => {
    const newWorkflow: Omit<Workflow, 'id'> = {
      ...workflowData,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
      steps: workflowData.steps.map(step => ({
        ...step,
        status: 'pending',
      })),
    }
    createWorkflow(newWorkflow)
    setIsDialogOpen(false)
  }

  const handleRunWorkflow = async () => {
    if (!activeWorkflow) return
    try {
      await runWorkflow(activeWorkflow.id)
    } catch (error) {
      console.error('Failed to run workflow:', error)
    }
  }

  const handleSaveWorkflow = async () => {
    if (!activeWorkflow) return
    try {
      await saveWorkflow(activeWorkflow.id)
    } catch (error) {
      console.error('Failed to save workflow:', error)
    }
  }

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold">Agent Workflow</h2>
          <p className="mt-1 text-muted-foreground">Visualize and manage agent workflows</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setIsDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New
          </Button>
          {activeWorkflow && (
            <>
              <Button
                variant="outline"
                onClick={handleRunWorkflow}
                disabled={activeWorkflow.status === 'running'}
              >
                <Play className="mr-2 h-4 w-4" />
                Run
              </Button>
              <Button variant="outline" onClick={handleSaveWorkflow}>
                <Save className="mr-2 h-4 w-4" />
                Save
              </Button>
              <Button variant="outline">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {activeWorkflow ? (
          <WorkflowVisualizer workflow={activeWorkflow} />
        ) : (
          <Card className="p-8 text-center">
            <h3 className="mb-2 text-lg font-medium">No Active Workflow</h3>
            <p className="mb-4 text-muted-foreground">
              Create a new workflow to get started with agent automation
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Workflow
            </Button>
          </Card>
        )}
      </div>

      <WorkflowDialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleCreateWorkflow}
      />
    </div>
  )
}
