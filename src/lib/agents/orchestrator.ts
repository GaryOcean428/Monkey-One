import { BaseAgent } from './base'
import type { Message } from '../../types'
import { memoryManager } from '../memory'

export class OrchestratorAgent extends BaseAgent {
  constructor(id: string, name: string) {
    super(id, name, 'orchestrator', ['task_planning', 'task_delegation', 'progress_tracking'])
  }

  async processMessage(message: Message): Promise<Message> {
    try {
      // Store the incoming message
      await memoryManager.add({
        type: 'user-message',
        content: message.content,
        tags: ['user-input'],
      })

      // Process the message and generate a response
      const response = await this.generateResponse(message.content)

      return this.createResponse(response)
    } catch (error) {
      console.error('Error in OrchestratorAgent:', error)
      return this.createResponse(
        'I encountered an error while processing your message. Please try again.'
      )
    }
  }

  private async generateResponse(content: string): Promise<string> {
    // For now, return a simple response
    // In a full implementation, this would involve more sophisticated processing
    return `I understand your message: "${content}". I'm working on implementing full processing capabilities.`
  }
}
