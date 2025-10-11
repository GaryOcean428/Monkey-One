import type { Message } from '../../types'
import { AgentType } from '../../types'
import type { Action } from '../../types/chat'
import { BaseAgent } from '../agents/base'
import type { Feedback } from '../learning/FeedbackManager'

interface ActionResult {
  success: boolean
  output: string
  metadata?: Record<string, unknown>
}

export class ReflectiveAgent extends BaseAgent {
  private readonly history: Array<{ action: Action; result: ActionResult }> = []
  private readonly feedbackLog: Feedback[] = []

  constructor() {
    super('reflective-agent', 'ReflectiveAgent', AgentType.SPECIALIST, [])
  }

  async processMessage(message: Message): Promise<Message> {
    const summary = this.summarizeRecentInsights()
    const responseContent = summary
      ? `Reflective summary based on recent actions:\n${summary}\n\nReceived message: ${message.content}`
      : `Received message: ${message.content}`

    return this.createResponse(responseContent)
  }

  async reflect(action: Action, result: ActionResult): Promise<void> {
    this.history.push({ action, result })
  }

  async improve(feedback: Feedback): Promise<void> {
    this.feedbackLog.push(feedback)
  }

  private summarizeRecentInsights(): string {
    if (!this.history.length) {
      return ''
    }

    const latest = this.history.slice(-3)
    return latest
      .map(entry => {
        const outcome = entry.result.success ? 'succeeded' : 'failed'
        return `Action ${entry.action.id} (${entry.action.description}) ${outcome}: ${entry.result.output}`
      })
      .join('\n')
  }
}
