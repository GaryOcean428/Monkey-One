import { Message } from '../../types/core'
import { AgentStatus } from '../../types/core'
import { AgentType, AgentCapabilityType, AgentMetrics } from '../../types/agent'

export abstract class BaseAgent {
  protected capabilities: AgentCapabilityType[] = []
  protected id: string
  protected type: AgentType
  protected status: AgentStatus = AgentStatus.IDLE
  protected metrics: AgentMetrics = {
    lastExecutionTime: 0,
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    averageResponseTime: 0
  }

  constructor(id?: string, type: AgentType = AgentType.BASE) {
    this.id = id || `${type}-${Date.now()}`
    this.type = type
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
    this.metrics.averageResponseTime = (
      (this.metrics.averageResponseTime * (this.metrics.totalRequests - 1) + executionTime) / 
      this.metrics.totalRequests
    )
  }

  abstract handleMessage(message: Message): Promise<{ success: boolean }>
}
