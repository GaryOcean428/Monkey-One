// Agent Types
export interface Agent {
  id: string
  type: AgentType
  status: AgentStatus
  capabilities: string[]
  initialize(): Promise<void>
  handleMessage(message: Message): Promise<Message>
}

export enum AgentType {
  BASE = 'BASE',
  ORCHESTRATOR = 'ORCHESTRATOR',
  WEB_SURFER = 'WEB_SURFER',
  FILE_SURFER = 'FILE_SURFER',
  CODER = 'CODER'
}

export enum AgentStatus {
  IDLE = 'IDLE',
  BUSY = 'BUSY',
  ERROR = 'ERROR'
}

// Message Types
export interface Message {
  id: string
  type: MessageType
  sender: string
  recipient: string
  content: unknown
  timestamp?: number
  metadata?: Record<string, unknown>
}

export enum MessageType {
  COMMAND = 'COMMAND',
  RESPONSE = 'RESPONSE',
  ERROR = 'ERROR',
  STATUS = 'STATUS',
  TASK = 'TASK'
}

// Tool Types
export interface Tool {
  id: string
  name: string
  description: string
  execute: (params: unknown) => Promise<unknown>
  validate: (params: unknown) => boolean
}

export interface ToolResult {
  success: boolean
  data?: unknown
  error?: Error
}

// Runtime Types
export interface RuntimeConfig {
  maxConcurrentAgents: number
  rateLimit: {
    requests: number
    windowMs: number
  }
  monitoring: {
    enablePerformance: boolean
    enableErrorReporting: boolean
    logLevel: LogLevel
  }
}

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error'
}

// Memory Types
export interface MemoryItem {
  id: string
  type: MemoryType
  content: unknown
  timestamp: number
  metadata?: Record<string, unknown>
}

export enum MemoryType {
  CONVERSATION = 'CONVERSATION',
  TASK = 'TASK',
  STATE = 'STATE'
}

// Error Types
export class AgentError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: Record<string, unknown>
  ) {
    super(message)
    this.name = 'AgentError'
  }
}

// Utility Types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

export type AsyncResult<T> = Promise<{
  success: boolean
  data?: T
  error?: Error
}>
