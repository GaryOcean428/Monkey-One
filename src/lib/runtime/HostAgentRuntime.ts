import { BaseAgent } from '../agents/base'
import { Message, AgentCapability } from '../../types'
import { AgentRegistry } from '../registry/AgentRegistry'
import { LogLevel } from '../../constants/enums'
import { logger } from '../../utils/logger'
import { RuntimeError } from '../errors/AgentErrors'
import { v4 as uuidv4 } from 'uuid'

export interface HostRuntimeConfig {
  logLevel: LogLevel
  maxAgents?: number
  timeout?: number
}

export class HostAgentRuntime {
  private agents: Map<string, BaseAgent> = new Map()
  private registry: AgentRegistry

  constructor() {
    this.registry = AgentRegistry.getInstance()
  }

  async createAgent(type: string, capabilities: string[] = []): Promise<BaseAgent> {
    logger.info('Creating agent:', { type, capabilities })

    try {
      const agent = (await this.registry.createAgent(type)) as BaseAgent
      capabilities.forEach(cap =>
        agent.addCapability({
          name: cap,
          description: `Capability ${cap}`,
        })
      )
      await agent.initialize()
      this.agents.set(agent.id, agent)
      return agent
    } catch (error) {
      throw new RuntimeError(`Failed to create agent: ${error.message}`)
    }
  }

  async cloneAgent(agentId: string, newCapabilities?: string[]): Promise<BaseAgent> {
    const sourceAgent = this.agents.get(agentId)
    if (!sourceAgent) {
      throw new RuntimeError(`Agent ${agentId} not found`)
    }

    const capabilities = newCapabilities || sourceAgent.getCapabilities().map(cap => cap.name)

    const clonedAgent = await this.createAgent(sourceAgent.type, capabilities)
    return clonedAgent
  }

  async broadcastMessage(message: Message, filter?: (agent: BaseAgent) => boolean): Promise<void> {
    const targets = filter
      ? Array.from(this.agents.values()).filter(filter)
      : Array.from(this.agents.values())

    await Promise.all(targets.map(agent => agent.processMessage(message)))
  }

  async shutdown(timeout = 5000): Promise<void> {
    const shutdownPromises = Array.from(this.agents.values()).map(agent => {
      return Promise.race([
        agent.shutdown(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Shutdown timeout')), timeout)
        ),
      ])
    })

    await Promise.all(shutdownPromises)
    this.agents.clear()
  }
}
