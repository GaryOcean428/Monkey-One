import type { Message } from '../../types'
import { AgentStatus, AgentType } from '../../types'
import { BaseAgent } from '../agents/base'

type MessageContext = {
  lastSpeakerId?: string
  threadId?: string
  participants?: string[]
}

export class GroupChatManager extends BaseAgent {
  constructor(private readonly participants: Map<string, BaseAgent>) {
    super('group-chat-manager', 'GroupChatManager', AgentType.ORCHESTRATOR, [])
  }

  async processMessage(message: Message): Promise<Message> {
    const nextSpeakerId = await this.selectNextSpeaker({
      lastSpeakerId: message.sender,
      threadId: message.id,
      participants: Array.from(this.participants.keys()),
    })

    if (!nextSpeakerId) {
      return this.createResponse('No available participants to continue the discussion.')
    }

    const nextAgent = this.participants.get(nextSpeakerId)
    if (!nextAgent) {
      return this.createResponse(`Unable to find participant with id ${nextSpeakerId}.`)
    }

    const response = await nextAgent.handleMessage(message)
    return response
  }

  async selectNextSpeaker(context: MessageContext): Promise<string | null> {
    const availableAgent = Array.from(this.participants.values()).find(
      agent => agent.status === AgentStatus.IDLE
    )

    if (availableAgent) {
      return availableAgent.id
    }

    const participantIds = context.participants ?? Array.from(this.participants.keys())
    if (!participantIds.length) {
      return null
    }

    const lastIndex = context.lastSpeakerId
      ? participantIds.indexOf(context.lastSpeakerId)
      : -1
    const nextIndex = (lastIndex + 1) % participantIds.length
    return participantIds[nextIndex] ?? null
  }

  registerParticipant(agent: BaseAgent): void {
    this.participants.set(agent.id, agent)
  }

  removeParticipant(agentId: string): void {
    this.participants.delete(agentId)
  }
}
