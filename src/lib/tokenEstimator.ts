import { XAIMessage } from './types'

interface TokenEstimate {
  promptTokens: number
  expectedResponseTokens: number
  totalTokens: number
}

export class TokenEstimator {
  // Average tokens per character for different languages
  private static readonly TOKENS_PER_CHAR = {
    en: 0.25, // English
    code: 0.35, // Programming code
    json: 0.4, // JSON/structured data
  }

  // Token multipliers for different response types
  private static readonly RESPONSE_MULTIPLIERS = {
    casual_conversation: 1.0,
    direct_answer: 1.2,
    chain_of_thought: 2.0,
    boolean_with_explanation: 1.5,
    comparative_analysis: 2.5,
    open_discussion: 1.8,
    code_generation: 3.0,
    debug_explanation: 2.5,
  }

  // Estimate tokens for a given text
  public static estimateTokens(text: string, type: 'en' | 'code' | 'json' = 'en'): number {
    return Math.ceil(text.length * this.TOKENS_PER_CHAR[type])
  }

  // Estimate tokens for code blocks
  private static estimateCodeTokens(text: string): number {
    const codeBlockRegex = /```[\s\S]*?```/g
    const codeBlocks = text.match(codeBlockRegex) || []
    let remainingText = text

    let totalTokens = 0
    for (const block of codeBlocks) {
      totalTokens += this.estimateTokens(block, 'code')
      remainingText = remainingText.replace(block, '')
    }

    return totalTokens + this.estimateTokens(remainingText, 'en')
  }

  // Estimate response length based on task type
  private static estimateResponseLength(
    taskType: string,
    responseStrategy: string,
    promptLength: number
  ): number {
    const baseMultiplier = this.RESPONSE_MULTIPLIERS[responseStrategy] || 1.5
    const taskMultipliers = {
      coding: 2.0,
      analysis: 1.8,
      creative: 1.5,
      casual: 0.8,
      general: 1.0,
    }

    const taskMultiplier = taskMultipliers[taskType] || 1.0
    return Math.ceil(promptLength * baseMultiplier * taskMultiplier)
  }

  // Estimate tokens for the entire conversation
  public static estimateConversationTokens(
    messages: XAIMessage[],
    taskType: string,
    responseStrategy: string
  ): TokenEstimate {
    let promptTokens = 0

    // Calculate tokens for each message
    for (const message of messages) {
      promptTokens += this.estimateCodeTokens(message.content)

      // Add overhead for message metadata
      promptTokens += this.estimateTokens(JSON.stringify({ role: message.role }), 'json')
    }

    // Estimate response tokens
    const expectedResponseTokens = this.estimateResponseLength(
      taskType,
      responseStrategy,
      promptTokens
    )

    return {
      promptTokens,
      expectedResponseTokens,
      totalTokens: promptTokens + expectedResponseTokens,
    }
  }

  // Check if we're approaching model's context limit
  public static isApproachingContextLimit(estimate: TokenEstimate, modelLimit: number): boolean {
    return estimate.totalTokens > modelLimit * 0.8
  }

  // Suggest chunk size for long conversations
  public static suggestChunkSize(totalTokens: number, modelLimit: number): number {
    const safetyMargin = 0.2 // 20% safety margin
    const maxChunkTokens = modelLimit * (1 - safetyMargin)
    return Math.floor(maxChunkTokens)
  }

  // Estimate cost based on model pricing
  public static estimateCost(estimate: TokenEstimate, pricePerToken: number): number {
    return estimate.totalTokens * pricePerToken
  }
}
