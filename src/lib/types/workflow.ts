export type WorkflowStatus = 'pending' | 'running' | 'completed' | 'failed'

export interface WorkflowStep {
  id: string
  agentId: string
  action: string
  parameters: Record<string, unknown>
  dependencies?: string[]
  status: WorkflowStatus
  result?: unknown
  startTime?: number
  endTime?: number
  error?: string
}

export interface Workflow {
  id: string
  name: string
  description: string
  steps: WorkflowStep[]
  status: WorkflowStatus
  createdAt: number
  updatedAt: number
  metadata: Record<string, unknown>
  ownerId?: string
  teamId?: string
  tags?: string[]
  priority?: number
  schedule?: {
    type: 'once' | 'recurring'
    startDate: number
    endDate?: number
    interval?: string // cron expression for recurring workflows
  }
}

export interface WorkflowTemplate {
  id: string
  name: string
  description: string
  steps: Omit<WorkflowStep, 'status' | 'result' | 'startTime' | 'endTime' | 'error'>[]
  metadata: Record<string, unknown>
  tags?: string[]
  category?: string
  version: string
}

export interface WorkflowExecutionOptions {
  priority?: number
  timeout?: number
  retryPolicy?: {
    maxAttempts: number
    backoffMultiplier: number
    initialDelay: number
  }
  notifications?: {
    onStart?: boolean
    onComplete?: boolean
    onError?: boolean
    channels?: string[]
  }
}

export interface WorkflowSearchQuery {
  status?: WorkflowStatus
  dateRange?: {
    start: number
    end: number
  }
  tags?: string[]
  ownerId?: string
  teamId?: string
  priority?: number
  limit?: number
  offset?: number
  sortBy?: 'createdAt' | 'updatedAt' | 'priority' | 'status'
  sortOrder?: 'asc' | 'desc'
}

export interface WorkflowStats {
  totalWorkflows: number
  activeWorkflows: number
  completedWorkflows: number
  failedWorkflows: number
  averageExecutionTime: number
  successRate: number
}
