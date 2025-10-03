import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Button } from '../ui/button'
import { useWorkflow } from '../../hooks/useWorkflow'
import type { WorkflowDefinition } from '../../types'

interface SaveWorkflowDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  workflow: WorkflowDefinition | null
}

export function SaveWorkflowDialog({ open, onOpenChange, workflow }: SaveWorkflowDialogProps) {
  const [name, setName] = useState(workflow?.name || '')
  const [description, setDescription] = useState(workflow?.description || '')
  const { saveWorkflow, isSaving } = useWorkflow()

  const handleSave = async () => {
    if (!workflow) return
    await saveWorkflow(workflow.id, name, description)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save Workflow</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Workflow Name</label>
            <Input
              placeholder="Enter workflow name"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              placeholder="Describe what this workflow does"
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={4}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name || isSaving}>
            {isSaving ? 'Saving...' : 'Save Workflow'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
