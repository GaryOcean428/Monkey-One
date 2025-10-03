import { Agent, Message } from '../../../types/core'
import { AgentRegistry } from '../../registry/AgentRegistry'

export class HandoffManager {
  private static instance: HandoffManager
  private registry: AgentRegistry

  private constructor() {
    this.registry = AgentRegistry.getInstance()
  }

  static getInstance(): HandoffManager {
    if (!HandoffManager.instance) {
      HandoffManager.instance = new HandoffManager()
    }
    return HandoffManager.instance
  }

  async evaluateHandoff(
    message: Message,
    agent?: Agent
  ): Promise<{ requiredCapabilities: string[] } | null> {
    // Extract required capabilities from message
    const capabilities = this.extractCapabilities(message)

    if (agent && capabilities.every(cap => agent.capabilities.includes(cap))) {
      return null
    }

    return { requiredCapabilities: capabilities }
  }

  private extractCapabilities(message: Message): string[] {
    const capabilities: string[] = []
    const content = message.content.toLowerCase()

    if (content.includes('typescript') || content.includes('code')) {
      capabilities.push('code_analysis')
    }
    if (content.includes('design') || content.includes('architecture')) {
      capabilities.push('system_design')
    }
    // Add more capability detection logic as needed

    return capabilities
  }

  async findBestAgent(
    requiredCapabilities: string[],
    availableAgents: Agent[]
  ): Promise<Agent | null> {
    return (
      availableAgents.find(agent =>
        requiredCapabilities.every(cap => agent.capabilities.includes(cap))
      ) || null
    )
  }
}
