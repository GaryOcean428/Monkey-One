import type { Timeout } from 'node:timers'
import type { MemoryUsage } from 'node:process'

export enum MessageType {
  USER = 'USER',
  SYSTEM = 'SYSTEM',
  TASK = 'TASK',
  RESPONSE = 'RESPONSE',
  ERROR = 'ERROR',
  BROADCAST = 'BROADCAST',
  HANDOFF = 'HANDOFF',
  COMMAND = 'COMMAND',
}

export enum AgentType {
  ORCHESTRATOR = 'ORCHESTRATOR',
  WORKER = 'WORKER',
  SPECIALIST = 'SPECIALIST',
}

export enum AgentStatus {
  AVAILABLE = 'AVAILABLE',
  BUSY = 'BUSY',
  OFFLINE = 'OFFLINE',
  ERROR = 'ERROR',
}

export enum AgentCapabilityType {
  CHAT = 'chat',
  RAG = 'rag',
  MEMORY = 'memory',
  TOOLS = 'tools',
  SEARCH = 'search',
  CODE = 'code',
}

export interface Message {
  id: string
  type: MessageType
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: number
  metadata?: Record<string, unknown>
  status?: 'sending' | 'sent' | 'error'
  sender?: string
  recipient?: string
}

export interface AgentCapability {
  type: AgentCapabilityType
  description: string
  parameters?: {
    type: string
    properties?: Record<string, unknown>
    required?: string[]
  }
}

export interface AgentMetrics {
  totalRequests: number
  successfulRequests: number
  failedRequests: number
  averageResponseTime: number
  lastResponseTime: number
  uptime: number
  memoryUsage: MemoryUsage
}

export type Timer = Timeout

export type MessageHandler<T = unknown, R = unknown> = (message: T) => Promise<R>
export type ErrorHandler = (error: Error) => void
export type ResponseHandler<T = unknown> = (response: T) => void

export interface Agent {
  id: string
  name: string
  type: AgentType
  capabilities: Set<AgentCapabilityType>
  status: AgentStatus
  description?: string
  provider?: string

  initialize(): Promise<void>
  processMessage(message: Message): Promise<Message>
  handleRequest(capability: string, params: Record<string, unknown>): Promise<unknown>
  getCapabilities(): AgentCapability[]
  hasCapability(type: AgentCapabilityType): boolean
  addCapability(type: AgentCapabilityType): void
  removeCapability(type: AgentCapabilityType): void
  validateParameters(capability: string, params: Record<string, unknown>): void
  getMetrics(): AgentMetrics
  onMemoryCleanup(handler: () => void): void
  cleanupMemory(): void
  shutdown(): Promise<void>
}
