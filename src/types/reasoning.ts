export type ThoughtType =
  | 'understanding'
  | 'approach'
  | 'solution'
  | 'verification'
  | 'analysis'
  | 'planning'
  | 'decision'

export interface ThoughtProcess {
  type: ThoughtType
  content: string
  metadata?: Record<string, unknown>
  timestamp?: number
}

export interface PlanningStep {
  id: string
  description: string
  estimatedDuration: number
  dependencies: string[]
  assignedTo: string | null
  status?: 'pending' | 'in_progress' | 'completed' | 'failed'
  metadata?: Record<string, unknown>
}

export interface WorkflowPlan {
  id: string
  steps: PlanningStep[]
  estimatedDuration: number
  createdAt: number
  updatedAt: number
  status: 'draft' | 'approved' | 'in_progress' | 'completed' | 'failed'
  metadata?: Record<string, unknown>
}

export interface TaskAnalysis {
  complexity: number
  requiresWorkflow: boolean
  requiredCapabilities: string[]
  estimatedSteps: number
  confidence: number
  suggestedApproach: string
  potentialChallenges: string[]
  metadata?: Record<string, unknown>
}

export interface ReasoningContext {
  taskId: string
  messageHistory: Array<{
    id: string
    content: string
    timestamp: number
    metadata?: Record<string, unknown>
  }>
  thoughtChain: ThoughtProcess[]
  currentPlan?: WorkflowPlan
  analysis?: TaskAnalysis
}
