import { Agent, AgentType } from '../types/core'
import { RuntimeError } from '../errors/AgentErrors'
import { logger } from '../../utils/logger'
import { BaseAgent } from '../agents/base'
import { v4 as uuidv4 } from 'uuid'

export class AgentRegistry {
  private static instance: AgentRegistry
  private agents: Map<string, () => Promise<Agent>>

  private constructor() {
    this.agents = new Map()
    this.registerBaseAgent()
  }

  private registerBaseAgent() {
    this.agents.set('BASE', async () => {
      try {
        const agent = new BaseAgent(uuidv4(), 'Base Agent', AgentType.BASE)
        await agent.initialize()
        return agent
      } catch (error) {
        logger.error('Failed to create base agent', { error })
        throw new RuntimeError('Failed to create base agent', { cause: error })
      }
    })
  }

  static getInstance(): AgentRegistry {
    if (!AgentRegistry.instance) {
      AgentRegistry.instance = new AgentRegistry()
    }
    return AgentRegistry.instance
  }

  async register(type: string, factory: () => Promise<Agent>): Promise<void> {
    if (!type || typeof type !== 'string') {
      throw new RuntimeError('Invalid agent type')
    }

    if (this.agents.has(type)) {
      throw new RuntimeError(`Agent type ${type} is already registered`)
    }

    try {
      // Validate factory by creating a test agent
      const testAgent = await factory()
      if (!testAgent || !(testAgent instanceof BaseAgent)) {
        throw new RuntimeError('Factory must create valid agent instances')
      }
    } catch (error) {
      logger.error('Failed to validate agent factory', { type, error })
      throw new RuntimeError('Invalid agent factory', { cause: error })
    }

    this.agents.set(type, factory)
    logger.info(`Agent type ${type} registered`)
  }

  async unregister(type: string): Promise<void> {
    if (!type || typeof type !== 'string') {
      throw new RuntimeError('Invalid agent type')
    }

    if (!this.agents.has(type)) {
      throw new RuntimeError(`Agent type ${type} not registered`)
    }

    if (type === 'BASE') {
      throw new RuntimeError('Cannot unregister base agent type')
    }

    this.agents.delete(type)
    logger.info(`Agent type ${type} unregistered`)
  }

  async createAgent(type: string): Promise<Agent> {
    if (!type || typeof type !== 'string') {
      throw new RuntimeError('Invalid agent type')
    }

    const factory = this.agents.get(type)
    if (!factory) {
      throw new RuntimeError(`Agent type ${type} not registered`)
    }

    try {
      const agent = await factory()
      if (!agent || !(agent instanceof BaseAgent)) {
        throw new RuntimeError('Factory created invalid agent instance')
      }
      return agent
    } catch (error) {
      logger.error('Failed to create agent', { type, error })
      throw new RuntimeError(`Failed to create agent of type ${type}`, { cause: error })
    }
  }

  hasAgent(type: string): boolean {
    return Boolean(type) && this.agents.has(type)
  }

  reset(): void {
    const baseFactory = this.agents.get('BASE')
    this.agents.clear()
    if (baseFactory) {
      this.agents.set('BASE', baseFactory)
    } else {
      this.registerBaseAgent()
    }
    logger.info('Agent registry reset')
  }

  getRegisteredTypes(): string[] {
    return Array.from(this.agents.keys())
  }
}
