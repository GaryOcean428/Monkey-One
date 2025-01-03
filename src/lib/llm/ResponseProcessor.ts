import { EventEmitter } from 'events'
import { llmManager } from './providers'
import type { Message } from '../../types'

interface ProcessedResponse {
  content: string
  confidence: number
  context: {
    relevantMemories: string[]
    topicContinuity: number
    contextualRelevance: number
  }
  metadata: {
    processingTime: number
    tokensUsed: number
    model: string
  }
}

export class ResponseProcessor extends EventEmitter {
  private calculateRelevanceScore(memory: string, query: string): number {
    const memoryWords = new Set(memory.toLowerCase().split(' '))
    const queryWords = new Set(query.toLowerCase().split(' '))
    const intersection = new Set([...memoryWords].filter(x => queryWords.has(x)))
    const union = new Set([...memoryWords, ...queryWords])
    return intersection.size / union.size
  }

  private calculateTopicContinuity(currentMessage: string, previousMessages: Message[]): number {
    if (previousMessages.length === 0) return 1

    const recentMessages = previousMessages.slice(-3)
    const scores = recentMessages.map(msg =>
      this.calculateRelevanceScore(msg.content, currentMessage)
    )

    return scores.reduce((acc, score) => acc + score, 0) / scores.length
  }

  async processResponse(
    userMessage: string,
    agentId: string,
    context: Message[] = []
  ): Promise<ProcessedResponse> {
    const startTime = Date.now()

    try {
      // Calculate topic continuity
      const topicContinuity = this.calculateTopicContinuity(userMessage, context)

      // Generate streaming response
      let fullResponse = ''
      const responseStream = llmManager.sendStreamingMessage(userMessage, context)

      for await (const chunk of responseStream) {
        fullResponse += chunk
        this.emit('chunk', chunk)
      }

      // Calculate contextual relevance
      const contextualRelevance = this.calculateRelevanceScore(fullResponse, userMessage)

      const processingTime = Date.now() - startTime
      const tokensUsed = Math.ceil(fullResponse.length / 4) // Rough estimate

      return {
        content: fullResponse,
        confidence: (topicContinuity + contextualRelevance) / 2,
        context: {
          relevantMemories: [],
          topicContinuity,
          contextualRelevance,
        },
        metadata: {
          processingTime,
          tokensUsed,
          model: llmManager.getActiveProvider().name,
        },
      }
    } catch (error) {
      console.error('Error processing response:', error)
      throw error
    }
  }

  async processStreamingResponse(
    userMessage: string,
    agentId: string,
    context: Message[] = []
  ): Promise<AsyncGenerator<string>> {
    try {
      const responseStream = llmManager.sendStreamingMessage(userMessage, context)
      return responseStream
    } catch (error) {
      console.error('Error processing streaming response:', error)
      throw error
    }
  }
}
