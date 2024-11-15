import { Agent, AgentStatus, Message, MessageType } from '@/types'
import { RuntimeError } from '../errors/AgentErrors'

export interface AgentMetrics {
  messageCount: number
  errorCount: number
  averageResponseTime: number
  lastActive: number
  status: AgentStatus
}

export interface MonitoringStats {
  activeAgents: number
  totalMessages: number
  totalErrors: number
  agentMetrics: Record<string, AgentMetrics>
}

export class AgentMonitor {
  private agents: Map<string, Agent>
  private metrics: Map<string, AgentMetrics>
  private messageTimestamps: Map<string, number>

  constructor() {
    this.agents = new Map()
    this.metrics = new Map()
    this.messageTimestamps = new Map()
  }

  public registerAgent(agent: Agent): void {
    if (this.agents.has(agent.id)) {
      throw new RuntimeError(
        'Agent already registered',
        { agentId: agent.id }
      )
    }

    this.agents.set(agent.id, agent)
    this.metrics.set(agent.id, {
      messageCount: 0,
      errorCount: 0,
      averageResponseTime: 0,
      lastActive: Date.now(),
      status: agent.status
    })
  }

  public unregisterAgent(agentId: string): void {
    this.agents.delete(agentId)
    this.metrics.delete(agentId)
  }

  public trackMessage(message: Message): void {
    const agentId = message.sender
    const metrics = this.metrics.get(agentId)

    if (!metrics) {
      throw new RuntimeError(
        'Agent not registered',
        { agentId }
      )
    }

    // Update message count
    metrics.messageCount++
    metrics.lastActive = Date.now()

    // Track message timestamp for response time calculation
    if (message.type === MessageType.COMMAND || message.type === MessageType.TASK) {
      this.messageTimestamps.set(message.id, Date.now())
    }

    // Update error count
    if (message.type === MessageType.ERROR) {
      metrics.errorCount++
    }

    // Calculate response time for responses
    if (message.type === MessageType.RESPONSE && message.metadata?.originalMessageId) {
      const startTime = this.messageTimestamps.get(message.metadata.originalMessageId as string)
      if (startTime) {
        const responseTime = Date.now() - startTime
        metrics.averageResponseTime = 
          (metrics.averageResponseTime * (metrics.messageCount - 1) + responseTime) / 
          metrics.messageCount
        this.messageTimestamps.delete(message.metadata.originalMessageId as string)
      }
    }

    this.metrics.set(agentId, metrics)
  }

  public updateAgentStatus(agentId: string, status: AgentStatus): void {
    const metrics = this.metrics.get(agentId)
    if (!metrics) {
      throw new RuntimeError(
        'Agent not registered',
        { agentId }
      )
    }

    metrics.status = status
    metrics.lastActive = Date.now()
    this.metrics.set(agentId, metrics)
  }

  public getAgentMetrics(agentId: string): AgentMetrics {
    const metrics = this.metrics.get(agentId)
    if (!metrics) {
      throw new RuntimeError(
        'Agent not registered',
        { agentId }
      )
    }
    return { ...metrics }
  }

  public getMonitoringStats(): MonitoringStats {
    let totalMessages = 0
    let totalErrors = 0
    const agentMetrics: Record<string, AgentMetrics> = {}

    this.metrics.forEach((metrics, agentId) => {
      totalMessages += metrics.messageCount
      totalErrors += metrics.errorCount
      agentMetrics[agentId] = { ...metrics }
    })

    return {
      activeAgents: Array.from(this.metrics.values()).filter(
        m => m.status === AgentStatus.BUSY
      ).length,
      totalMessages,
      totalErrors,
      agentMetrics
    }
  }

  public getActiveAgents(): Agent[] {
    return Array.from(this.agents.values()).filter(
      agent => agent.status === AgentStatus.BUSY
    )
  }

  public getIdleAgents(): Agent[] {
    return Array.from(this.agents.values()).filter(
      agent => agent.status === AgentStatus.IDLE
    )
  }

  public getErroredAgents(): Agent[] {
    return Array.from(this.agents.values()).filter(
      agent => agent.status === AgentStatus.ERROR
    )
  }

  public clearMetrics(agentId: string): void {
    const metrics = this.metrics.get(agentId)
    if (!metrics) {
      throw new RuntimeError(
        'Agent not registered',
        { agentId }
      )
    }

    this.metrics.set(agentId, {
      messageCount: 0,
      errorCount: 0,
      averageResponseTime: 0,
      lastActive: Date.now(),
      status: metrics.status
    })
  }

  public clearAllMetrics(): void {
    this.metrics.forEach((_, agentId) => {
      this.clearMetrics(agentId)
    })
  }

  public startOperation(name: string): void {
    if (!this.active) {
      this.operationStartTimes.set(name, Date.now());
    }
  }

  public addMetric(name: string, value: number): void {
    if (!this.active) {
      this.customMetrics.set(name, value);
    }
  }

  private calculateSuccessRate(operationName: string): number {
    const operation = this.metrics.operations.find(op => op.name === operationName);
    if (!operation) {
      return 0;
    }

    const totalAttempts = operation.count;
    const errorCount = this.metrics.operations
      .filter(op => op.name.startsWith(`${operationName}.error`))
      .reduce((sum, op) => sum + op.count, 0);

    return totalAttempts > 0 ? (totalAttempts - errorCount) / totalAttempts : 0;
  }
}
