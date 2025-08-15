import { BaseAgent } from '../BaseAgent'
import { AgentType, MessageType, AgentCapabilityType, Message } from '../../types/core'
import { Logger } from '../../logger/Logger'
import { MessageHandler } from '../../decorators/MessageHandler'
import { ToolExecutionError } from '../../errors/AgentErrors'
import { searchAll } from '../../api/search' // Import the searchAll function

const logger = new Logger('OrchestratorAgent')

export class OrchestratorAgent extends BaseAgent {
  private activeAgents: Map<string, BaseAgent>
  private taskQueue: Message[]

  constructor(id?: string, name?: string) {
    super(id || 'orchestrator-1', name || 'Orchestrator Agent', AgentType.ORCHESTRATOR, [
      AgentCapabilityType.TOOLS,
      AgentCapabilityType.MEMORY,
      AgentCapabilityType.CODE,
    ])

    this.activeAgents = new Map()
    this.taskQueue = []
  }

  @MessageHandler(MessageType.TASK)
  async handleTaskAssignment(message: Message): Promise<void> {
    try {
      const requirements = message.metadata?.requirements as AgentCapabilityType[]
      const task = message.content

      if (!requirements || !task) {
        throw new Error('Invalid task message format')
      }

      if (task.startsWith('search:')) {
        const query = task.replace('search:', '').trim()
        const results = await this.performParallelSearch(query)
        logger.info(`Search results: ${JSON.stringify(results)}`)
      } else {
        const suitableAgent = this.findSuitableAgent(requirements)

        if (suitableAgent) {
          await this.assignTask(suitableAgent, task)
        } else {
          this.taskQueue.push(message)
          logger.warn('No suitable agent found for task, queued for later')
        }
      }
    } catch (error) {
      throw new ToolExecutionError('Failed to handle task assignment', {
        error: error instanceof Error ? error.message : String(error),
      })
    }
  }

  @MessageHandler(MessageType.SYSTEM)
  async handleAgentRegistration(message: Message): Promise<void> {
    try {
      const agentId = message.sender
      const capabilities = message.metadata?.capabilities as AgentCapabilityType[]

      if (!agentId || !capabilities) {
        throw new Error('Invalid registration message format')
      }

      this.activeAgents.set(agentId, message.sender as unknown as BaseAgent)
      await this.processQueuedTasks()
    } catch (error) {
      throw new ToolExecutionError('Failed to register agent', {
        error: error instanceof Error ? error.message : String(error),
      })
    }
  }

  @MessageHandler(MessageType.SYSTEM)
  async handleAgentDeregistration(message: Message): Promise<void> {
    try {
      const agentId = message.sender
      if (!agentId) {
        throw new Error('Invalid deregistration message format')
      }

      this.activeAgents.delete(agentId)
      logger.info(`Agent ${agentId} deregistered`)
    } catch (error) {
      throw new ToolExecutionError('Failed to deregister agent', {
        error: error instanceof Error ? error.message : String(error),
      })
    }
  }

  private findSuitableAgent(requirements: AgentCapabilityType[]): BaseAgent | null {
    for (const agent of this.activeAgents.values()) {
      if (this.hasRequiredCapabilities(agent, requirements)) {
        return agent
      }
    }
    return null
  }

  private hasRequiredCapabilities(agent: BaseAgent, requirements: AgentCapabilityType[]): boolean {
    return requirements.every(req => agent.hasCapability(req))
  }

  private async assignTask(agent: BaseAgent, task: string): Promise<void> {
    try {
      const message: Message = {
        id: `task-${Date.now()}`,
        type: MessageType.TASK,
        role: 'system',
        content: task,
        timestamp: Date.now(),
        sender: this.getId(),
        recipient: agent.getId(),
      }

      await agent.handleMessage(message)
      logger.info(`Task assigned to agent ${agent.getId()}`)
    } catch (error) {
      throw new ToolExecutionError('Failed to assign task', {
        error: error instanceof Error ? error.message : String(error),
      })
    }
  }

  private async processQueuedTasks(): Promise<void> {
    const remainingTasks: Message[] = []

    for (const message of this.taskQueue) {
      const requirements = message.metadata?.requirements as AgentCapabilityType[]
      const agent = this.findSuitableAgent(requirements)

      if (agent) {
        await this.assignTask(agent, message.content)
      } else {
        remainingTasks.push(message)
      }
    }

    this.taskQueue = remainingTasks
  }

  private async performParallelSearch(query: string): Promise<any> {
    try {
      const filters = {} // Define any necessary filters
      const results = await searchAll(query, filters)
      return results
    } catch (error) {
      logger.error('Error performing parallel search:', error)
      throw error
    }
  }

  async handleMessage(message: Message): Promise<void> {
    switch (message.type) {
      case MessageType.TASK:
        await this.handleTaskAssignment(message)
        break
      case MessageType.SYSTEM:
        if (message.metadata?.action === 'register') {
          await this.handleAgentRegistration(message)
        } else if (message.metadata?.action === 'deregister') {
          await this.handleAgentDeregistration(message)
        }
        break
      default:
        logger.warn(`Unhandled message type: ${message.type}`)
    }
  }

  async shutdown(): Promise<void> {
    try {
      for (const agent of this.activeAgents.values()) {
        await agent.shutdown()
      }
      this.activeAgents.clear()
      logger.info('OrchestratorAgent shutdown complete')
    } catch (error) {
      throw new ToolExecutionError('Failed to shutdown orchestrator', {
        error: error instanceof Error ? error.message : String(error),
      })
    }
  }

  // Public methods for external access
  public async registerAgent(agent: BaseAgent): Promise<void> {
    const agentId = agent.getId()
    
    if (this.activeAgents.has(agentId)) {
      throw new Error(`Agent ${agentId} is already registered`)
    }
    
    this.activeAgents.set(agentId, agent)
    await this.processQueuedTasks()
    logger.info(`Agent ${agentId} registered successfully`)
  }

  public async unregisterAgent(agentId: string): Promise<void> {
    if (!this.activeAgents.has(agentId)) {
      throw new Error(`Agent ${agentId} is not registered`)
    }
    
    this.activeAgents.delete(agentId)
    logger.info(`Agent ${agentId} unregistered successfully`)
  }

  public getAgents(): BaseAgent[] {
    return Array.from(this.activeAgents.values())
  }
}
