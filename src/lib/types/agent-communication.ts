export enum AgentMessageType {
  CAPABILITY_REQUEST = 'CAPABILITY_REQUEST',
  CAPABILITY_RESPONSE = 'CAPABILITY_RESPONSE',
  TASK_REQUEST = 'TASK_REQUEST',
  TASK_RESPONSE = 'TASK_RESPONSE',
  STATE_UPDATE = 'STATE_UPDATE',
  ERROR = 'ERROR',
}

export interface AgentMessage {
  id: string
  type: 'QUERY' | 'COMMAND' | 'STATE_UPDATE'
  content: unknown
  timestamp: number
  priority?: number
}

export interface AgentResponse {
  messageId: string
  content: unknown
  status: 'SUCCESS' | 'ERROR'
  error?: string
  timestamp: number
}

export interface AgentCommunicationConfig {
  retryAttempts: number
  retryDelay: number
  timeout: number
  priorityLevels: number[]
}

export interface AgentCommunicationStats {
  totalMessages: number
  successfulMessages: number
  failedMessages: number
  averageResponseTime: number
  lastMessageTimestamp: number
}

export interface CapabilityRequest {
  type: AgentCapabilityType
  requirements?: Record<string, unknown>
}

export interface CapabilityResponse {
  available: boolean
  agent: string
  capabilities: AgentCapabilityType[]
  metadata?: Record<string, unknown>
}

export interface TaskRequest {
  capability: AgentCapabilityType
  params: Record<string, unknown>
  deadline?: number
  priority?: number
}

export interface TaskResponse {
  success: boolean
  result?: unknown
  error?: string
  metrics?: {
    startTime: number
    endTime: number
    resourceUsage?: Record<string, number>
  }
}

export interface StateUpdate {
  agent: string
  status: string
  metrics: {
    cpu: number
    memory: number
    taskQueue: number
  }
  timestamp: number
}

export interface AgentCommunicationOptions {
  retryAttempts?: number
  timeout?: number
  priority?: number
  persistent?: boolean
}
