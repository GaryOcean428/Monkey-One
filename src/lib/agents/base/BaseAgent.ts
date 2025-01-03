import { AgentType, AgentStatus } from '../../types/agent'
import type {
  Agent,
  Message,
  AgentCapabilityType,
  AgentMetrics,
  AgentConfig,
  MessageResponse,
} from '../../types/agent'

export abstract class BaseAgent implements Agent {
  protected capabilities: AgentCapabilityType[] = []
  protected status: AgentStatus = AgentStatus.IDLE
  protected metrics: AgentMetrics = {
    lastExecutionTime: 0,
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    averageResponseTime: 0,
  }

  protected readonly id: string
  protected readonly type: AgentType
  protected readonly name: string

  constructor(config: AgentConfig) {
    this.id = config.id
    this.name = config.name
    this.type = config.type

    if (config.capabilities) {
      config.capabilities.forEach((cap: AgentCapabilityType) => this.addCapability(cap))
    }
  }

  getId(): string {
    return this.id
  }

  getType(): AgentType {
    return this.type
  }

  getStatus(): AgentStatus {
    return this.status
  }

  hasCapability(capability: AgentCapabilityType): boolean {
    return this.capabilities.some(cap => cap.name === capability.name)
  }

  addCapability(capability: AgentCapabilityType): void {
    if (!this.hasCapability(capability)) {
      this.capabilities.push(capability)
    }
  }

  removeCapability(capability: AgentCapabilityType): void {
    this.capabilities = this.capabilities.filter(cap => cap.name !== capability.name)
  }

  getCapabilities(): AgentCapabilityType[] {
    return [...this.capabilities]
  }

  getMetrics(): AgentMetrics {
    return { ...this.metrics }
  }

  protected updateMetrics(startTime: number): void {
    const endTime = Date.now()
    const executionTime = endTime - startTime

    this.metrics.lastExecutionTime = executionTime
    this.metrics.totalRequests++
    this.metrics.averageResponseTime =
      (this.metrics.averageResponseTime * (this.metrics.totalRequests - 1) + executionTime) /
      this.metrics.totalRequests
  }

  abstract handleMessage(message: Message): Promise<{ success: boolean }>
  abstract handleRequest(request: unknown): Promise<unknown>
  abstract handleToolUse(tool: unknown): Promise<MessageResponse>
}
