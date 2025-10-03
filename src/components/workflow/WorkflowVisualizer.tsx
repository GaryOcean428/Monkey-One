import { Card } from '../ui/card'
import { Badge } from '../ui/badge'
import { Circle, CheckCircle2, XCircle } from 'lucide-react'

interface WorkflowStep {
  id: string
  name: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  agent?: string
  startTime?: Date
  endTime?: Date
}

interface Workflow {
  id: string
  name: string
  description?: string
  steps: WorkflowStep[]
  status: 'pending' | 'running' | 'completed' | 'failed'
  createdAt: Date
  updatedAt: Date
}

interface WorkflowVisualizerProps {
  workflow: Workflow
}

export function WorkflowVisualizer({ workflow }: WorkflowVisualizerProps) {
  const getStatusIcon = (status: WorkflowStep['status']) => {
    switch (status) {
      case 'pending':
        return <Circle className="h-5 w-5 text-gray-400" />
      case 'running':
        return <Circle className="h-5 w-5 animate-pulse text-blue-500" />
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />
    }
  }

  const getStatusColor = (status: WorkflowStep['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-gray-100 text-gray-600'
      case 'running':
        return 'bg-blue-100 text-blue-600'
      case 'completed':
        return 'bg-green-100 text-green-600'
      case 'failed':
        return 'bg-red-100 text-red-600'
    }
  }

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">{workflow.name}</h3>
        {workflow.description && (
          <p className="text-muted-foreground mt-1 text-sm">{workflow.description}</p>
        )}
        <div className="mt-2 flex items-center gap-2">
          <Badge variant="outline" className={getStatusColor(workflow.status)}>
            {workflow.status.charAt(0).toUpperCase() + workflow.status.slice(1)}
          </Badge>
          <span className="text-muted-foreground text-sm">
            Created {new Date(workflow.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {workflow.steps.map((step, index) => (
          <div key={step.id} className="relative">
            <div className="flex items-start gap-4">
              <div className="mt-1 flex-shrink-0">{getStatusIcon(step.status)}</div>
              <div className="flex-grow">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">{step.name}</h4>
                  <Badge variant="outline" className={getStatusColor(step.status)}>
                    {step.status}
                  </Badge>
                </div>
                {step.agent && (
                  <p className="text-muted-foreground mt-1 text-sm">Agent: {step.agent}</p>
                )}
                {step.startTime && (
                  <p className="text-muted-foreground text-sm">
                    Started: {new Date(step.startTime).toLocaleString()}
                  </p>
                )}
                {step.endTime && (
                  <p className="text-muted-foreground text-sm">
                    Completed: {new Date(step.endTime).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
            {index < workflow.steps.length - 1 && (
              <div className="absolute top-8 bottom-0 left-2.5 w-px bg-gray-200 dark:bg-gray-800" />
            )}
          </div>
        ))}
      </div>
    </Card>
  )
}
