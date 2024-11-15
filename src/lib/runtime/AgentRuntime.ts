import { Agent, Message, RuntimeConfig, Tool, AgentStatus, MessageType } from '@/types'
import { MessageQueue } from '../memory/MessageQueue'
import { AgentMonitor } from '../monitoring/AgentMonitor'
import { RuntimeError } from '../errors/AgentErrors'

export class AgentRuntime {
  private agents: Map<string, Agent>
  private tools: Map<string, Tool>
  private messageQueue: MessageQueue
  private monitor: AgentMonitor
  private config: RuntimeConfig

  constructor(config: RuntimeConfig) {
    this.agents = new Map()
    this.tools = new Map()
    this.messageQueue = new MessageQueue()
    this.monitor = new AgentMonitor()
    this.config = config
  }

  public async registerAgent(agent: Agent): Promise<void> {
    if (this.agents.has(agent.id)) {
      throw new RuntimeError(
        'Agent already registered',
        { agentId: agent.id }
      )
    }

    if (this.getActiveAgentCount() >= this.config.maxConcurrentAgents) {
      throw new RuntimeError(
        'Maximum concurrent agents limit reached',
        { 
          current: this.getActiveAgentCount(),
          max: this.config.maxConcurrentAgents
        }
      )
    }

    this.agents.set(agent.id, agent)
    this.monitor.registerAgent(agent)

    try {
      await agent.initialize()
    } catch (error) {
      this.agents.delete(agent.id)
      this.monitor.unregisterAgent(agent.id)
      throw error
    }
  }

  public unregisterAgent(agentId: string): void {
    const agent = this.agents.get(agentId)
    if (!agent) {
      throw new RuntimeError(
        'Agent not found',
        { agentId }
      )
    }

    this.agents.delete(agentId)
    this.monitor.unregisterAgent(agentId)
  }

  public registerTool(tool: Tool): void {
    if (this.tools.has(tool.id)) {
      throw new RuntimeError(
        'Tool already registered',
        { toolId: tool.id }
      )
    }

    this.tools.set(tool.id, tool)
  }

  public async sendMessage(message: Message): Promise<Message> {
    this.validateMessage(message)
    this.checkRateLimit(message.sender)

    const recipient = this.agents.get(message.recipient)
    if (!recipient) {
      throw new RuntimeError(
        'Recipient agent not found',
        { recipientId: message.recipient }
      )
    }

    this.messageQueue.enqueue(message)
    this.monitor.trackMessage(message)

    try {
      const response = await recipient.handleMessage(message)
      this.monitor.trackMessage(response)
      return response
    } catch (error) {
      const errorMessage: Message = {
        id: `error-${message.id}`,
        type: MessageType.ERROR,
        sender: message.recipient,
        recipient: message.sender,
        content: error,
        timestamp: Date.now(),
        metadata: {
          originalMessageId: message.id,
          error: true
        }
      }
      this.monitor.trackMessage(errorMessage)
      throw error
    }
  }

  public async executeTool(toolId: string, params: unknown): Promise<unknown> {
    const tool = this.tools.get(toolId)
    if (!tool) {
      throw new RuntimeError(
        'Tool not found',
        { toolId }
      )
    }

    if (!tool.validate(params)) {
      throw new RuntimeError(
        'Invalid tool parameters',
        { toolId, params }
      )
    }

    return await tool.execute(params)
  }

  public getAgent(agentId: string): Agent | undefined {
    return this.agents.get(agentId)
  }

  public getTool(toolId: string): Tool | undefined {
    return this.tools.get(toolId)
  }

  public getAgentsByType(type: string): Agent[] {
    return Array.from(this.agents.values()).filter(agent => agent.type === type)
  }

  public getAgentsByCapability(capability: string): Agent[] {
    return Array.from(this.agents.values()).filter(
      agent => agent.capabilities.includes(capability)
    )
  }

  public getActiveAgents(): Agent[] {
    return this.monitor.getActiveAgents()
  }

  public getIdleAgents(): Agent[] {
    return this.monitor.getIdleAgents()
  }

  public getErroredAgents(): Agent[] {
    return this.monitor.getErroredAgents()
  }

  public getMonitoringStats() {
    return this.monitor.getMonitoringStats()
  }

  private getActiveAgentCount(): number {
    return this.monitor.getActiveAgents().length
  }

  private validateMessage(message: Message): void {
    if (!message.id || !message.type || !message.sender || !message.recipient) {
      throw new RuntimeError(
        'Invalid message format',
        { message }
      )
    }

    if (!this.agents.has(message.sender)) {
      throw new RuntimeError(
        'Sender agent not registered',
        { senderId: message.sender }
      )
    }

    if (!this.agents.has(message.recipient)) {
      throw new RuntimeError(
        'Recipient agent not registered',
        { recipientId: message.recipient }
      )
    }
  }

  private checkRateLimit(agentId: string): void {
    const metrics = this.monitor.getAgentMetrics(agentId)
    const timeWindow = this.config.rateLimit.windowMs
    const maxRequests = this.config.rateLimit.requests

    const recentMessages = metrics.messageCount
    if (recentMessages >= maxRequests) {
      throw new RuntimeError(
        'Rate limit exceeded',
        {
          agentId,
          timeWindow,
          maxRequests,
          currentRequests: recentMessages
        }
      )
    }
  }

  public async shutdown(): Promise<void> {
    // Clean up resources and perform graceful shutdown
    for (const [agentId, agent] of this.agents) {
      try {
        if (agent.status === AgentStatus.BUSY) {
          // Wait for agent to finish current task
          // Implement timeout logic if needed
        }
        this.unregisterAgent(agentId)
      } catch (error) {
        // Log shutdown errors but continue with other agents
        console.error(`Error shutting down agent ${agentId}:`, error)
      }
    }

    // Clear message queue and monitoring data
    this.messageQueue.clear()
    this.monitor.clearAllMetrics()
  }
}
