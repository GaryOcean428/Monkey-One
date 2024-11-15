import { Agent, AgentStatus, Message } from '@/types'
import { RuntimeError } from '../errors/AgentErrors'

export interface StateTransition {
  from: AgentStatus
  to: AgentStatus
  condition?: (agent: Agent) => boolean | Promise<boolean>
  action?: (agent: Agent) => void | Promise<void>
}

export interface StateConfig {
  allowedTransitions: StateTransition[]
  onEnter?: (agent: Agent) => void | Promise<void>
  onExit?: (agent: Agent) => void | Promise<void>
  onMessage?: (agent: Agent, message: Message) => void | Promise<void>
  timeout?: number
  maxRetries?: number
}

export class AgentState {
  private agent: Agent
  private stateConfigs: Map<AgentStatus, StateConfig>
  private transitionHistory: Array<{
    from: AgentStatus
    to: AgentStatus
    timestamp: number
  }>
  private retryCount: Map<AgentStatus, number>
  private timeoutHandles: Map<AgentStatus, NodeJS.Timeout>

  constructor(agent: Agent) {
    this.agent = agent
    this.stateConfigs = new Map()
    this.transitionHistory = []
    this.retryCount = new Map()
    this.timeoutHandles = new Map()

    // Initialize default state configurations
    this.initializeDefaultStates()
  }

  public registerState(status: AgentStatus, config: StateConfig): void {
    if (this.stateConfigs.has(status)) {
      throw new RuntimeError(
        'State already registered',
        { status }
      )
    }

    this.validateStateConfig(config)
    this.stateConfigs.set(status, config)
  }

  public async transition(to: AgentStatus): Promise<void> {
    const from = this.agent.status
    const config = this.stateConfigs.get(from)

    if (!config) {
      throw new RuntimeError(
        'Current state not registered',
        { status: from }
      )
    }

    const transition = this.findAllowedTransition(from, to)
    if (!transition) {
      throw new RuntimeError(
        'Invalid state transition',
        { from, to }
      )
    }

    if (transition.condition) {
      const allowed = await transition.condition(this.agent)
      if (!allowed) {
        throw new RuntimeError(
          'State transition condition not met',
          { from, to }
        )
      }
    }

    try {
      // Execute exit action for current state
      if (config.onExit) {
        await config.onExit(this.agent)
      }

      // Execute transition action if defined
      if (transition.action) {
        await transition.action(this.agent)
      }

      // Update agent status
      this.agent.status = to

      // Execute enter action for new state
      const newConfig = this.stateConfigs.get(to)
      if (newConfig?.onEnter) {
        await newConfig.onEnter(this.agent)
      }

      // Record transition
      this.transitionHistory.push({
        from,
        to,
        timestamp: Date.now()
      })

      // Reset retry count for the new state
      this.retryCount.set(to, 0)

      // Setup timeout if configured
      this.setupStateTimeout(to)
    } catch (error) {
      // Handle transition failure
      await this.handleTransitionFailure(from, to, error as Error)
    }
  }

  public async handleMessage(message: Message): Promise<void> {
    const config = this.stateConfigs.get(this.agent.status)
    if (!config) {
      throw new RuntimeError(
        'Current state not registered',
        { status: this.agent.status }
      )
    }

    if (config.onMessage) {
      await config.onMessage(this.agent, message)
    }
  }

  public getTransitionHistory(): Array<{
    from: AgentStatus
    to: AgentStatus
    timestamp: number
  }> {
    return [...this.transitionHistory]
  }

  public getCurrentState(): StateConfig {
    const config = this.stateConfigs.get(this.agent.status)
    if (!config) {
      throw new RuntimeError(
        'Current state not registered',
        { status: this.agent.status }
      )
    }
    return { ...config }
  }

  public getAllowedTransitions(): AgentStatus[] {
    const currentConfig = this.stateConfigs.get(this.agent.status)
    if (!currentConfig) {
      return []
    }

    return currentConfig.allowedTransitions
      .map(transition => transition.to)
  }

  public dispose(): void {
    // Clear all timeouts
    for (const handle of this.timeoutHandles.values()) {
      clearTimeout(handle)
    }
    this.timeoutHandles.clear()
  }

  private initializeDefaultStates(): void {
    // Register default states with basic configurations
    this.registerState(AgentStatus.IDLE, {
      allowedTransitions: [
        { from: AgentStatus.IDLE, to: AgentStatus.BUSY }
      ]
    })

    this.registerState(AgentStatus.BUSY, {
      allowedTransitions: [
        { from: AgentStatus.BUSY, to: AgentStatus.IDLE },
        { from: AgentStatus.BUSY, to: AgentStatus.ERROR }
      ],
      timeout: 30000 // 30 seconds default timeout for busy state
    })

    this.registerState(AgentStatus.ERROR, {
      allowedTransitions: [
        { from: AgentStatus.ERROR, to: AgentStatus.IDLE }
      ],
      maxRetries: 3
    })
  }

  private validateStateConfig(config: StateConfig): void {
    if (!config.allowedTransitions || !Array.isArray(config.allowedTransitions)) {
      throw new RuntimeError(
        'State configuration must include allowed transitions array',
        { config }
      )
    }

    for (const transition of config.allowedTransitions) {
      if (!transition.from || !transition.to) {
        throw new RuntimeError(
          'Invalid transition configuration',
          { transition }
        )
      }
    }
  }

  private findAllowedTransition(from: AgentStatus, to: AgentStatus): StateTransition | undefined {
    const config = this.stateConfigs.get(from)
    return config?.allowedTransitions.find(
      transition => transition.from === from && transition.to === to
    )
  }

  private async handleTransitionFailure(from: AgentStatus, to: AgentStatus, error: Error): Promise<void> {
    const retryCount = (this.retryCount.get(to) || 0) + 1
    this.retryCount.set(to, retryCount)

    const config = this.stateConfigs.get(to)
    if (config?.maxRetries && retryCount <= config.maxRetries) {
      // Retry transition
      await this.transition(to)
    } else {
      // Transition to error state
      this.agent.status = AgentStatus.ERROR
      throw new RuntimeError(
        'State transition failed',
        {
          from,
          to,
          retryCount,
          error
        }
      )
    }
  }

  private setupStateTimeout(status: AgentStatus): void {
    // Clear any existing timeout for this state
    const existingTimeout = this.timeoutHandles.get(status)
    if (existingTimeout) {
      clearTimeout(existingTimeout)
    }

    const config = this.stateConfigs.get(status)
    if (config?.timeout) {
      const handle = setTimeout(async () => {
        try {
          // Attempt to transition to error state on timeout
          await this.transition(AgentStatus.ERROR)
        } catch (error) {
          console.error('Failed to handle state timeout:', error)
        }
      }, config.timeout)

      this.timeoutHandles.set(status, handle)
    }
  }
}
