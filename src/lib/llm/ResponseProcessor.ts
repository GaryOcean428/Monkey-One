import { EventEmitter } from '../utils/EventEmitter'
import { llmManager } from './providers'
import type { Message } from '../../types'
import { adaptMessagesForLLM } from './messageAdapter'

type ResponseEvents = {
  chunk: (data: string) => void
}

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
    error?: {
      code: string
      message: string
    }
  }
}

export class ResponseProcessor extends EventEmitter<ResponseEvents> {
  private static readonly MAX_RETRIES = 3
  private static readonly RETRY_DELAY = 1000 // ms

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

  private async retryWithExponentialBackoff<T>(
    operation: () => Promise<T>,
    retries = ResponseProcessor.MAX_RETRIES
  ): Promise<T> {
    try {
      return await operation()
    } catch (error) {
      if (retries === 0) throw error

      await new Promise(resolve =>
        setTimeout(
          resolve,
          ResponseProcessor.RETRY_DELAY * (ResponseProcessor.MAX_RETRIES - retries + 1)
        )
      )

      return this.retryWithExponentialBackoff(operation, retries - 1)
    }
  }

  private estimateTokenCount(text: string): number {
    // GPT-3 tokenizer approximation (4 characters per token on average)
    return Math.ceil(text.length / 4)
  }

  async processResponse(
    userMessage: string,
    agentId: string,
    context: Message[] = []
  ): Promise<ProcessedResponse> {
    const startTime = Date.now()
    let fullResponse = ''
    let error: { code: string; message: string } | undefined

    try {
      // Validate inputs
      if (!userMessage.trim()) {
        throw new Error('User message cannot be empty')
      }

      if (!agentId) {
        throw new Error('Agent ID is required')
      }

      // Calculate topic continuity
      const topicContinuity = this.calculateTopicContinuity(userMessage, context)

      // Convert messages to LLM format
      const llmMessages = adaptMessagesForLLM(context)

      // Generate streaming response with retry logic
      const responseStream = await this.retryWithExponentialBackoff(async () => {
        const stream = await llmManager.sendStreamingMessage(userMessage, llmMessages)
        return stream
      })

      for await (const chunk of responseStream) {
        if (typeof chunk !== 'string') {
          throw new Error('Invalid response chunk type')
        }
        fullResponse += chunk
        this.emit('chunk', chunk)
      }

      // Calculate contextual relevance
      const contextualRelevance = this.calculateRelevanceScore(fullResponse, userMessage)

      const processingTime = Date.now() - startTime
      const tokensUsed = this.estimateTokenCount(fullResponse)

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
    } catch (err) {
      error = {
        code: err instanceof Error ? err.name : 'UNKNOWN_ERROR',
        message: err instanceof Error ? err.message : 'An unknown error occurred',
      }

      console.error('Error processing response:', error)

      return {
        content: '',
        confidence: 0,
        context: {
          relevantMemories: [],
          topicContinuity: 0,
          contextualRelevance: 0,
        },
        metadata: {
          processingTime: Date.now() - startTime,
          tokensUsed: 0,
          model: llmManager.getActiveProvider().name,
          error,
        },
      }
    }
  }

  async processStreamingResponse(
    userMessage: string,
    agentId: string,
    context: Message[] = []
  ): Promise<AsyncGenerator<string>> {
    if (!userMessage.trim()) {
      throw new Error('User message cannot be empty')
    }

    if (!agentId) {
      throw new Error('Agent ID is required')
    }

    try {
      // Convert messages to LLM format
      const llmMessages = adaptMessagesForLLM(context)

      const stream = await this.retryWithExponentialBackoff(async () => {
        return await llmManager.sendStreamingMessage(userMessage, llmMessages)
      })

      return stream
    } catch (error) {
      console.error('Error processing streaming response:', error)
      throw error instanceof Error ? error : new Error('Unknown error in streaming response')
    }
  }
}
