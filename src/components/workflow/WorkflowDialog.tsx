import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Label } from '../ui/label'
import { Plus, X } from 'lucide-react'

interface WorkflowStep {
  id: string
  name: string
  agent?: string
  description?: string
}

interface WorkflowDialogProps {
  open: boolean
  onClose: () => void
  onSave: (workflow: { name: string; description: string; steps: WorkflowStep[] }) => void
}

export function WorkflowDialog({ open, onClose, onSave }: WorkflowDialogProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [steps, setSteps] = useState<WorkflowStep[]>([])

  const handleAddStep = () => {
    const newStep: WorkflowStep = {
      id: `step-${steps.length + 1}`,
      name: `Step ${steps.length + 1}`,
    }
    setSteps([...steps, newStep])
  }

  const handleRemoveStep = (stepId: string) => {
    setSteps(steps.filter(step => step.id !== stepId))
  }

  const handleUpdateStep = (stepId: string, updates: Partial<WorkflowStep>) => {
    setSteps(steps.map(step => (step.id === stepId ? { ...step, ...updates } : step)))
  }

  const handleSave = () => {
    if (!name.trim()) return
    onSave({
      name,
      description,
      steps,
    })
    handleReset()
  }

  const handleReset = () => {
    setName('')
    setDescription('')
    setSteps([])
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Workflow</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Workflow Name</Label>
            <Input
              id="name"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Enter workflow name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Enter workflow description"
              rows={3}
            />
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Steps</Label>
              <Button type="button" variant="outline" size="sm" onClick={handleAddStep}>
                <Plus className="mr-2 h-4 w-4" />
                Add Step
              </Button>
            </div>
            <div className="space-y-4">
              {steps.map(step => (
                <div key={step.id} className="flex items-start gap-4">
                  <div className="flex-grow space-y-2">
                    <Input
                      value={step.name}
                      onChange={e => handleUpdateStep(step.id, { name: e.target.value })}
                      placeholder="Step name"
                    />
                    <Input
                      value={step.agent || ''}
                      onChange={e => handleUpdateStep(step.id, { agent: e.target.value })}
                      placeholder="Assigned agent (optional)"
                    />
                    <Textarea
                      value={step.description || ''}
                      onChange={e => handleUpdateStep(step.id, { description: e.target.value })}
                      placeholder="Step description (optional)"
                      rows={2}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveStep(step.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleReset}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name.trim()}>
            Create Workflow
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
