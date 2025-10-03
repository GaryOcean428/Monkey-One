export interface Tool {
  name: string
  description: string
  execute: (args: Record<string, unknown>) => Promise<unknown>
}

export interface ToolSpec {
  name: string
  description: string
  validation: {
    parameters: Record<
      string,
      {
        type: string
        description: string
        required?: boolean
        default?: unknown
        enum?: unknown[]
        pattern?: string
        minLength?: number
        maxLength?: number
        minimum?: number
        maximum?: number
        items?: {
          type: string
          description?: string
        }
      }
    >
    returns: {
      type: string
      description: string
      schema?: Record<string, unknown>
    }
  }
  metadata?: {
    category?: string
    tags?: string[]
    version?: string
    author?: string
    documentation?: string
    examples?: Array<{
      description: string
      args: Record<string, unknown>
      expected: unknown
    }>
    security?: {
      requiresAuth?: boolean
      permissions?: string[]
      rateLimit?: number
    }
  }
}

export interface ToolResult<T = unknown> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: unknown
  }
  metadata?: {
    duration: number
    timestamp: string
    resourceUsage?: {
      cpu?: number
      memory?: number
    }
  }
}

export interface ToolContext {
  userId?: string
  sessionId?: string
  requestId?: string
  timestamp: string
  environment: 'development' | 'staging' | 'production'
  security?: {
    token?: string
    permissions: string[]
  }
}

export interface ToolEvent {
  type: 'start' | 'complete' | 'error' | 'progress'
  toolName: string
  timestamp: string
  data?: unknown
  error?: Error
  progress?: {
    current: number
    total: number
    message?: string
  }
}

export type ToolEventHandler = (event: ToolEvent) => void | Promise<void>
