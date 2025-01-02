import {
  Agent,
  AgentType,
  AgentStatus,
  AgentCapability,
  AgentCapabilityType,
  AgentMetrics,
  Message,
} from '../../types/core'
import { logger } from '../../../utils/logger'
import { v4 as uuidv4 } from 'uuid'

export class BaseAgent implements Agent {
  id: string
  name: string
  type: AgentType
  capabilities: Set<AgentCapabilityType>
  status: AgentStatus
  description?: string
  provider?: string
  private metrics: AgentMetrics
  private startTime: number
  private cleanupHandlers: Array<() => void>

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
      memoryUsage: {
        heapTotal: 0,
        heapUsed: 0,
        external: 0,
        arrayBuffers: 0,
      },
    }
  }

  async initialize(): Promise<void> {
    logger.info('Base agent initialized', { id: this.id, type: this.type })
  }

  async processMessage(message: Message): Promise<Message> {
    try {
      this.metrics.totalRequests++
      const startTime = Date.now()

      // Process message logic here
      const response: Message = {
        id: uuidv4(),
        type: message.type,
        content: 'Processed message',
        timestamp: Date.now(),
        metadata: {
          sender: this.id,
          recipient: message.metadata?.sender,
        },
      }

      const endTime = Date.now()
      this.metrics.lastResponseTime = endTime - startTime
      this.metrics.successfulRequests++
      return response
    } catch (error) {
      this.metrics.failedRequests++
      throw error
    }
  }

  async handleRequest(
    _capability: AgentCapabilityType,
    _params: Record<string, unknown>
  ): Promise<unknown> {
    if (!this.hasCapability(_capability)) {
      throw new Error(`Agent does not have capability: ${_capability}`)
    }
    // Handle request implementation
    return {}
  }

  getCapabilities(): AgentCapability[] {
    return Array.from(this.capabilities).map(type => ({
      type,
      name: type,
      description: `Capability for ${type}`,
    }))
  }

  hasCapability(type: AgentCapabilityType): boolean {
    return this.capabilities.has(type)
  }

  addCapability(type: AgentCapabilityType): void {
    this.capabilities.add(type)
  }

  removeCapability(type: AgentCapabilityType): void {
    this.capabilities.delete(type)
  }

  validateParameters(_capability: AgentCapabilityType, _params: Record<string, unknown>): void {
    const cap = this.getCapabilities().find(c => c.type === _capability)
    if (!cap) {
      throw new Error(`Invalid capability: ${_capability}`)
    }
    if (cap.schema) {
      // Validate params against schema
    }
  }

  getMetrics(): AgentMetrics {
    const now = Date.now()
    this.metrics.uptime = now - this.startTime
    this.metrics.memoryUsage = {
      ...process.memoryUsage(),
    }
    return this.metrics
  }

  onMemoryCleanup(handler: () => void): void {
    this.cleanupHandlers.push(handler)
  }

  cleanupMemory(): void {
    this.cleanupHandlers.forEach(handler => handler())
  }

  async shutdown(): Promise<void> {
    this.status = AgentStatus.OFFLINE
    this.cleanupMemory()
  }
}
