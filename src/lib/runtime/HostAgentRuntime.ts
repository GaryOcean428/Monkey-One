import { Agent, AgentType, Message, RuntimeConfig, Tool } from '@/types'
import { AgentRuntime } from './AgentRuntime'
import { RuntimeError } from '../errors/AgentErrors'

export interface HostRuntimeConfig extends RuntimeConfig {
  enablePersistence?: boolean
  persistencePath?: string
  autoRecover?: boolean
  shutdownTimeout?: number
}

export class HostAgentRuntime extends AgentRuntime {
  private persistenceEnabled: boolean
  private persistencePath: string
  private autoRecover: boolean
  private shutdownTimeout: number
  private persistenceInterval?: NodeJS.Timeout

  constructor(config: HostRuntimeConfig) {
    super(config)
    this.persistenceEnabled = config.enablePersistence ?? false
    this.persistencePath = config.persistencePath ?? './agent-state'
    this.autoRecover = config.autoRecover ?? true
    this.shutdownTimeout = config.shutdownTimeout ?? 5000

    if (this.persistenceEnabled) {
      this.setupPersistence()
    }

    if (this.autoRecover) {
      this.recoverState()
    }
  }

  public async registerAgent(agent: Agent): Promise<void> {
    await super.registerAgent(agent)
    if (this.persistenceEnabled) {
      await this.persistState()
    }
  }

  public override unregisterAgent(agentId: string): void {
    super.unregisterAgent(agentId)
    if (this.persistenceEnabled) {
      this.persistState().catch(error => {
        console.error('Failed to persist state after unregistering agent:', error)
      })
    }
  }

  public override registerTool(tool: Tool): void {
    super.registerTool(tool)
    if (this.persistenceEnabled) {
      this.persistState().catch(error => {
        console.error('Failed to persist state after registering tool:', error)
      })
    }
  }

  public async createAgent(type: AgentType, capabilities: string[]): Promise<Agent> {
    const AgentClass = await this.loadAgentClass(type)
    if (!AgentClass) {
      throw new RuntimeError(
        'Agent type not supported',
        { type }
      )
    }

    const agent = new AgentClass(capabilities)
    await this.registerAgent(agent)
    return agent
  }

  public async cloneAgent(agentId: string, newCapabilities?: string[]): Promise<Agent> {
    const sourceAgent = this.getAgent(agentId)
    if (!sourceAgent) {
      throw new RuntimeError(
        'Source agent not found',
        { agentId }
      )
    }

    const capabilities = newCapabilities ?? sourceAgent.capabilities
    return this.createAgent(sourceAgent.type, capabilities)
  }

  public async broadcast(message: Omit<Message, 'recipient'>, filter?: (agent: Agent) => boolean): Promise<Message[]> {
    const recipients = Array.from(this.getAgents().values())
      .filter(agent => !filter || filter(agent))

    const responses: Message[] = []
    for (const recipient of recipients) {
      try {
        const response = await this.sendMessage({
          ...message,
          recipient: recipient.id
        })
        responses.push(response)
      } catch (error) {
        console.error(`Failed to send message to agent ${recipient.id}:`, error)
      }
    }

    return responses
  }

  public override async shutdown(): Promise<void> {
    if (this.persistenceEnabled) {
      await this.persistState()
      clearInterval(this.persistenceInterval)
    }

    const shutdownPromise = super.shutdown()
    const timeoutPromise = new Promise<void>((_, reject) => {
      setTimeout(() => {
        reject(new Error('Shutdown timeout exceeded'))
      }, this.shutdownTimeout)
    })

    try {
      await Promise.race([shutdownPromise, timeoutPromise])
    } catch (error) {
      console.error('Shutdown error:', error)
      // Force shutdown after timeout
      this.forceShutdown()
    }
  }

  private getAgents(): Map<string, Agent> {
    // Access protected agents map through type assertion
    return (this as any).agents
  }

  private async loadAgentClass(type: AgentType): Promise<new (capabilities: string[]) => Agent> {
    // Dynamic import based on agent type
    try {
      const module = await import(`../agents/${type.toLowerCase()}`)
      return module.default
    } catch (error) {
      throw new RuntimeError(
        'Failed to load agent class',
        { type, error }
      )
    }
  }

  private async persistState(): Promise<void> {
    if (!this.persistenceEnabled) return

    const state = {
      agents: Array.from(this.getAgents().entries()),
      tools: Array.from((this as any).tools.entries()),
      timestamp: Date.now()
    }

    try {
      // In a real implementation, this would write to a file or database
      console.log('Persisting state:', state)
    } catch (error) {
      throw new RuntimeError(
        'Failed to persist state',
        { error }
      )
    }
  }

  private async recoverState(): Promise<void> {
    if (!this.persistenceEnabled || !this.autoRecover) return

    try {
      // In a real implementation, this would read from a file or database
      console.log('Recovering state...')
    } catch (error) {
      throw new RuntimeError(
        'Failed to recover state',
        { error }
      )
    }
  }

  private setupPersistence(): void {
    // Persist state periodically
    this.persistenceInterval = setInterval(
      () => this.persistState(),
      60000 // Every minute
    )
  }

  private forceShutdown(): void {
    // Force cleanup of resources
    clearInterval(this.persistenceInterval)
    this.getAgents().clear()
    ;(this as any).tools.clear()
    ;(this as any).messageQueue.clear()
    ;(this as any).monitor.clearAllMetrics()
  }
}
