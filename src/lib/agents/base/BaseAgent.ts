import {
  Agent,
  AgentType,
  AgentStatus,
  AgentCapability,
  AgentMetrics,
  Timer,
} from '../../../lib/types/core'
import { logger } from '../../../utils/logger'
import { v4 as uuidv4 } from 'uuid'
import type { MessagePayload, MessageResponse } from '../../types/messages'

export class BaseAgent implements Agent {
  id: string
  name: string
  type: AgentType
  capabilities: Set<AgentCapability>
  status: AgentStatus
  private metrics: AgentMetrics
  private startTime: number
  private cleanupHandlers: Array<() => void>
  private timeoutDuration: number

  constructor(
    id: string = uuidv4(),
    name: string = 'Base Agent',
    type: AgentType = AgentType.SPECIALIST
  ) {
    this.id = id
    this.name = name
    this.type = type
    this.capabilities = new Set()
    this.status = AgentStatus.AVAILABLE
    this.startTime = Date.now()
    this.cleanupHandlers = []
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      lastResponseTime: 0,
      uptime: 0,
      memoryUsage: process.memoryUsage(),
    }
    this.timeoutDuration = 100
  }

  async initialize(): Promise<void> {
    logger.info('Base agent initialized', { id: this.id, type: this.type })
  }

  setStatus(status: AgentStatus): void {
    this.status = status
  }

  async handleRequest(capability: string, params: MessagePayload): Promise<MessageResponse> {
    const startTime = Date.now()
    try {
      this.setStatus(AgentStatus.BUSY)

      // Simulate processing
      await new Promise(_resolve => this.initializeTimer().unref())

      this.metrics.successfulRequests++
      this.metrics.lastResponseTime = Date.now() - startTime

      return {
        status: 'success',
        data: params,
      }
    } catch (error) {
      this.metrics.failedRequests++
      throw error
    } finally {
      this.setStatus(AgentStatus.IDLE)
    }
  }

  protected async processMessage(_message: MessagePayload): Promise<MessageResponse> {
    return {
      id: uuidv4(),
      type: 'response',
      role: 'assistant',
      content: 'Base agent response',
      timestamp: Date.now(),
    }
  }

  protected async executeCapability(
    _capability: string,
    _params: Record<string, unknown>
  ): Promise<MessageResponse> {
    throw new Error('Method not implemented')
  }

  async shutdown(): Promise<void> {
    this.status = AgentStatus.OFFLINE
    logger.info('Base agent shutdown', { id: this.id })
  }

  getCapabilities(): AgentCapability[] {
    return Array.from(this.capabilities)
  }

  hasCapability(name: string): boolean {
    return Array.from(this.capabilities).some(cap => cap.name === name)
  }

  addCapability(capability: AgentCapability): void {
    if (!this.hasCapability(capability.name)) {
      this.capabilities.add(capability)
    }
  }

  removeCapability(name: string): void {
    for (const cap of this.capabilities) {
      if (cap.name === name) {
        this.capabilities.delete(cap)
        break
      }
    }
  }

  validateParameters(capability: string, params: any): void {
    const cap = Array.from(this.capabilities).find(c => c.name === capability)
    if (!cap) {
      throw new Error(`Capability ${capability} not found`)
    }

    if (!cap.schema) {
      return
    }

    // Basic schema validation
    const errors: string[] = []
    if (cap.schema.required) {
      for (const field of cap.schema.required) {
        if (!(field in params)) {
          errors.push(`Missing required field: ${field}`)
        }
      }
    }

    if (cap.schema.properties) {
      for (const [field, def] of Object.entries(cap.schema.properties)) {
        if (field in params) {
          const value = params[field]
          if (def.type && typeof value !== def.type) {
            errors.push(`Invalid type for ${field}: expected ${def.type}, got ${typeof value}`)
          }
        }
      }
    }

    if (errors.length > 0) {
      throw new Error(`Parameter validation failed:\n${errors.join('\n')}`)
    }
  }

  getMetrics(): AgentMetrics {
    this.metrics.uptime = Date.now() - this.startTime
    this.metrics.memoryUsage = process.memoryUsage()
    return { ...this.metrics }
  }

  onMemoryCleanup(handler: () => void): void {
    this.cleanupHandlers.push(handler)
  }

  cleanupMemory(): void {
    this.cleanupHandlers.forEach(handler => handler())
  }

  private initializeTimer(): Timer {
    return setTimeout(() => {
      // Implementation
    }, this.timeoutDuration)
  }
}
