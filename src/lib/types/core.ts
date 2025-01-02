// Core application types
export type TimeoutId = ReturnType<typeof setTimeout>
export type IntervalId = ReturnType<typeof setInterval>

export interface MemoryStats {
  heapUsed: number
  heapTotal: number
  external: number
  arrayBuffers: number
}

export type MessageType = 'SYSTEM' | 'USER' | 'ASSISTANT' | 'ERROR' | 'WARNING' | 'INFO' | 'DEBUG'

export interface Message {
  id: string
  type: MessageType
  content: string
  timestamp: number
  metadata?: Record<string, unknown>
}

export interface SystemConfig {
  maxMemoryUsage: number
  maxConcurrentTasks: number
  defaultTimeout: number
  debugMode: boolean
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

export interface AgentCapability {
  type: AgentCapabilityType
  name: string
  description: string
  schema?: Record<string, unknown>
}

export interface AgentMetrics {
  totalRequests: number
  successfulRequests: number
  failedRequests: number
  averageResponseTime: number
  lastResponseTime: number
  uptime: number
  memoryUsage: MemoryStats
}

export type MessageHandler = (message: Message) => Promise<Message>
export type ErrorHandler = (error: Error) => void
export type ResponseHandler = (response: Message) => void

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
