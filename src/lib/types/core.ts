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

import type { AgentType, AgentStatus, AgentCapabilityType, AgentMetrics } from './agent'

export type { AgentType, AgentStatus, AgentCapabilityType, AgentMetrics }

export interface LogLevel {
  ERROR: 0
  WARN: 1
  INFO: 2
  DEBUG: 3
  TRACE: 4
}

export interface CoreConfig {
  environment: 'development' | 'production' | 'test'
  logLevel: LogLevel
  version: string
}

export interface ErrorResponse {
  code: string
  message: string
  details?: unknown
}

export interface SuccessResponse<T = unknown> {
  data: T
  metadata?: Record<string, unknown>
}

export type ApiResponse<T = unknown> = SuccessResponse<T> | ErrorResponse

export interface Metrics {
  timestamp: number
  duration: number
  success: boolean
  error?: string
}

export type MessageHandler = (message: Message) => Promise<Message>
export type ErrorHandler = (error: Error) => void
export type ResponseHandler = (response: ApiResponse) => void
