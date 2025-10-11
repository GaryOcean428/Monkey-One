import type { Message } from '../../types'
import { BaseAgent } from '../agents/base'

type Aggregator = (responses: Message[]) => Promise<Message>

export class AgentMixture {
  constructor(
    private readonly layers: BaseAgent[][],
    private readonly aggregateResults: Aggregator = async responses => responses[responses.length - 1]
  ) { }

  async process(message: Message): Promise<Message> {
    let currentMessage = message
    for (const layer of this.layers) {
      const responses = await Promise.all(layer.map(agent => agent.handleMessage(currentMessage)))
      currentMessage = await this.aggregateResults(responses)
    }
    return currentMessage
  }
}
