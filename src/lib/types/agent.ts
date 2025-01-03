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

export interface AgentMetrics {
  lastExecutionTime: number
  totalRequests: number
  successfulRequests: number
  failedRequests: number
  averageResponseTime: number
}

export interface Agent {
  getId(): string
  getName(): string
  getType(): AgentType
  getStatus(): AgentStatus
  getCapabilities(): AgentCapabilityType[]
  hasCapability(capability: AgentCapabilityType): boolean
  addCapability(capability: AgentCapabilityType): void
  removeCapability(capability: AgentCapabilityType): void
  getMetrics(): AgentMetrics
  handleMessage(message: Message): Promise<{ success: boolean }>
  handleRequest(request: unknown): Promise<unknown>
  handleToolUse(tool: unknown): Promise<MessageResponse>
}

export interface Message {
  id: string
  type: string
  content: string
  timestamp: number
  metadata?: Record<string, unknown>
}

export interface MessageResponse {
  status: 'success' | 'error'
  data: unknown
}

export interface AgentConfig {
  id: string
  name: string
  type: AgentType
  capabilities: AgentCapabilityType[]
}
