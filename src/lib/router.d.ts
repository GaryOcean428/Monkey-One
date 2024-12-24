import { ModelConfig } from './models';
import { XAIMessage } from './types';

export interface RouterConfig {
  model: ModelConfig;
  maxTokens: number;
  temperature: number;
  responseStrategy: string;
  routingExplanation: string;
  questionType?: string;
}

export interface TokenEstimate {
  promptTokens: number;
  expectedResponseTokens: number;
  totalTokens: number;
}

export declare class AdvancedRouter {
  constructor(threshold?: number);
  
  /**
   * Route a query to the appropriate model based on complexity and context
   * @param query The user's input query
   * @param conversationHistory Previous messages in the conversation
   * @returns Configuration for processing the query
   */
  route(query: string, conversationHistory: XAIMessage[]): RouterConfig;
}

export declare class TokenEstimator {
  /**
   * Estimate tokens for a given text
   * @param text Text to estimate tokens for
   * @param type Content type ('en' | 'code' | 'json')
   * @returns Estimated number of tokens
   */
  static estimateTokens(text: string, type?: 'en' | 'code' | 'json'): number;

  /**
   * Estimate tokens for an entire conversation
   * @param messages Conversation history
   * @param taskType Type of task being performed
   * @param responseStrategy Strategy for generating response
   * @returns Token estimates for the conversation
   */
  static estimateConversationTokens(
    messages: XAIMessage[],
    taskType: string,
    responseStrategy: string
  ): TokenEstimate;

  /**
   * Check if approaching model's context limit
   * @param estimate Token estimate
   * @param modelLimit Model's maximum context length
   * @returns True if approaching limit
   */
  static isApproachingContextLimit(
    estimate: TokenEstimate,
    modelLimit: number
  ): boolean;

  /**
   * Suggest appropriate chunk size for long conversations
   * @param totalTokens Total tokens in conversation
   * @param modelLimit Model's maximum context length
   * @returns Suggested chunk size in tokens
   */
  static suggestChunkSize(totalTokens: number, modelLimit: number): number;

  /**
   * Estimate cost based on token usage
   * @param estimate Token estimate
   * @param pricePerToken Price per token in USD
   * @returns Estimated cost in USD
   */
  static estimateCost(estimate: TokenEstimate, pricePerToken: number): number;
}
