export interface AgentCapabilityType {
  name: string
  description: string
  version: string
  parameters: {
    [key: string]: {
      type: string
      description: string
      required: boolean
    }
  }
}

export enum AgentType {
  BASE = 'base',
  AMYGDALA = 'amygdala',
  BRAINSTEM = 'brainstem',
  CEREBELLUM = 'cerebellum',
  ORCHESTRATOR = 'orchestrator',
}

export enum AgentStatus {
  IDLE = 'idle',
  RUNNING = 'running',
  PAUSED = 'paused',
  ERROR = 'error',
  COMPLETED = 'completed',
}

export interface AgentConfig {
  id: string
  name: string
  type: AgentType
  capabilities: AgentCapabilityType[]
}

export interface AgentMetrics {
  lastExecutionTime: number
  totalRequests: number
  successfulRequests: number
  failedRequests: number
  averageResponseTime: number
}
