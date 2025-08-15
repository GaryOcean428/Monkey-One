import {
  Agent,
  AgentType,
  AgentStatus,
  AgentMetrics,
  AgentCapabilityType,
  Message,
  MessageResponse,
} from '../types/agent'

export class BaseAgent implements Agent {
  protected id: string
  protected name: string
  protected type: AgentType
  protected status: AgentStatus
  protected capabilities: Set<AgentCapabilityType>
  protected metrics: AgentMetrics

  constructor(
    id: string,
    name: string,
    type: AgentType = AgentType.BASE,
    capabilities: AgentCapabilityType[] = []
  ) {
    this.id = id
    this.name = name
    this.type = type
    this.status = AgentStatus.IDLE
    this.capabilities = new Set(capabilities)
    this.metrics = {
      lastExecutionTime: 0,
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
    }
  }

  getId(): string {
    return this.id
  }

  getName(): string {
    return this.name
  }

  getType(): AgentType {
    return this.type
  }

  getStatus(): AgentStatus {
    return this.status
  }

  setStatus(status: AgentStatus): void {
    this.status = status
  }

  getCapabilities(): AgentCapabilityType[] {
    return Array.from(this.capabilities)
  }

  hasCapability(capability: AgentCapabilityType): boolean {
    return this.capabilities.has(capability)
  }

  addCapability(capability: AgentCapabilityType): void {
    this.capabilities.add(capability)
  }

  removeCapability(capability: AgentCapabilityType): void {
    this.capabilities.delete(capability)
  }

  getMetrics(): AgentMetrics {
    return { ...this.metrics }
  }

  protected updateMetrics(success: boolean, executionTime: number): void {
    this.metrics.lastExecutionTime = executionTime
    this.metrics.totalRequests++
    if (success) {
      this.metrics.successfulRequests++
    } else {
      this.metrics.failedRequests++
    }
    this.metrics.averageResponseTime =
      (this.metrics.averageResponseTime * (this.metrics.totalRequests - 1) + executionTime) /
      this.metrics.totalRequests
  }

  async handleMessage(message: Message): Promise<{ success: boolean }> {
    const startTime = Date.now()
    try {
      // Basic message handling logic
      console.log(`Agent ${this.name} handling message:`, message)
      this.updateMetrics(true, Date.now() - startTime)
      return { success: true }
    } catch (error) {
      this.updateMetrics(false, Date.now() - startTime)
      return { success: false }
    }
  }

  async handleRequest(request: unknown): Promise<unknown> {
    const startTime = Date.now()
    try {
      // Basic request handling logic
      console.log(`Agent ${this.name} handling request:`, request)
      this.updateMetrics(true, Date.now() - startTime)
      return { success: true, data: request }
    } catch (error) {
      this.updateMetrics(false, Date.now() - startTime)
      throw error
    }
  }

  async handleToolUse(tool: unknown): Promise<MessageResponse> {
    const startTime = Date.now()
    try {
      // Basic tool use handling logic
      console.log(`Agent ${this.name} using tool:`, tool)
      this.updateMetrics(true, Date.now() - startTime)
      return {
        status: 'success',
        data: { tool, result: 'Tool used successfully' },
      }
    } catch (error) {
      this.updateMetrics(false, Date.now() - startTime)
      return {
        status: 'error',
        data: error,
      }
    }
  }
}
