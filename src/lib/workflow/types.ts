import { XAIMessage } from '../types'

export type WorkflowStatus = 'pending' | 'running' | 'completed' | 'failed' | 'paused' | 'delegated'

export type WorkflowTrigger = 'manual' | 'scheduled' | 'event' | 'condition' | 'dependency'

export type AgentRole =
  | 'coordinator'
  | 'executor'
  | 'reviewer'
  | 'planner'
  | 'researcher'
  | 'debugger'

export interface WorkflowStep {
  id: string
  name: string
  description: string
  role: AgentRole
  dependencies: string[]
  status: WorkflowStatus
  artifacts: WorkflowArtifact[]
  metadata: Record<string, any>
  retryPolicy?: RetryPolicy
}

export interface WorkflowArtifact {
  id: string
  type: string
  content: any
  metadata: Record<string, any>
  timestamp: Date
}

export interface RetryPolicy {
  maxAttempts: number
  backoffMultiplier: number
  initialDelay: number
  maxDelay: number
}

export interface WorkflowDefinition {
  id: string
  name: string
  description: string
  trigger: WorkflowTrigger
  steps: WorkflowStep[]
  context: Record<string, any>
  metadata: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

export interface WorkflowExecution {
  id: string
  workflowId: string
  status: WorkflowStatus
  currentStep: string
  history: WorkflowHistory[]
  context: Record<string, any>
  startedAt: Date
  completedAt?: Date
  error?: Error
}

export interface WorkflowHistory {
  timestamp: Date
  step: WorkflowStep
  status: WorkflowStatus
  metadata: Record<string, any>
  agentId: string
  messages: XAIMessage[]
}

export interface AgentCapability {
  id: string
  name: string
  description: string
  parameters: Record<string, any>
  constraints: Record<string, any>
  metadata: Record<string, any>
}

export interface Agent {
  id: string
  role: AgentRole
  capabilities: AgentCapability[]
  status: 'available' | 'busy' | 'offline'
  metadata: Record<string, any>
  currentTask?: string
}

export interface WorkflowEvent {
  id: string
  type: string
  payload: any
  timestamp: Date
  source: string
  metadata: Record<string, any>
}

export interface DelegationRequest {
  id: string
  taskId: string
  fromAgentId: string
  toAgentId: string
  context: Record<string, any>
  priority: number
  deadline?: Date
  status: 'pending' | 'accepted' | 'rejected' | 'completed'
}
