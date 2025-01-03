import { randomUUID } from 'crypto'
import { Agent } from '../types/agent'
import { AgentStatus } from '../types/agent'
import { Message } from '../types/messages'

export class AgentCommunicationService {
  private agents: Map<string, Agent>
  private messageQueue: Message[]
  private messageHandlers: Map<string, (message: Message) => void>

  constructor() {
    this.agents = new Map()
    this.messageQueue = []
    this.messageHandlers = new Map()
  }

  registerAgent(agent: Agent): void {
    this.agents.set(agent.getId(), agent)
  }

  unregisterAgent(agentId: string): void {
    this.agents.delete(agentId)
  }

  getAgent(agentId: string): Agent | undefined {
    return this.agents.get(agentId)
  }

  getAllAgents(): Agent[] {
    return Array.from(this.agents.values())
  }

  getAgentsByType(type: string): Agent[] {
    return this.getAllAgents().filter(agent => agent.getType() === type)
  }

  getAvailableAgents(): Agent[] {
    return this.getAllAgents().filter(agent => agent.getStatus() === AgentStatus.AVAILABLE)
  }

  async sendMessage(message: Message): Promise<void> {
    const targetAgent = this.agents.get(message.metadata?.recipient || '')
    
    if (!targetAgent) {
      throw new Error(`Target agent not found: ${message.metadata?.recipient}`)
    }

    if (targetAgent.getStatus() !== AgentStatus.AVAILABLE) {
      throw new Error(`Target agent is not available: ${message.metadata?.recipient}`)
    }

    message.id = randomUUID()
    message.timestamp = Date.now()

    this.messageQueue.push(message)
    await this.processMessageQueue()
  }

  private async processMessageQueue(): Promise<void> {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift()
      if (!message) {

      const targetAgent = this.agents.get(message.metadata?.recipient || '')
      if (!targetAgent) continue

      try {
        await targetAgent.handleMessage(message)
        const handler = this.messageHandlers.get(message.id)
        if (handler) {
          handler(message)
          this.messageHandlers.delete(message.id)
        }
      } catch (error) {
        console.error(`Error processing message ${message.id}:`, error)
      }
    }
  }

  onMessage(messageId: string, handler: (message: Message) => void): void {
    this.messageHandlers.set(messageId, handler)
  }

  clearMessageHandlers(): void {
    this.messageHandlers.clear()
  }
}
