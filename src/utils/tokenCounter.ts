import { logger } from './logger';

export interface TokenCount {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export class TokenCounter {
  // Simple estimation: ~4 characters per token for English text
  private static readonly CHARS_PER_TOKEN = 4;

  static validateContextLength(text: string, maxTokens: number): boolean {
    const estimatedTokens = Math.ceil(text.length / this.CHARS_PER_TOKEN);
    const isValid = estimatedTokens <= maxTokens;
    
    if (!isValid) {
      logger.warn(`Text length (${estimatedTokens} tokens) exceeds max context length (${maxTokens} tokens)`);
    }
    
    return isValid;
  }

  static getTokenCounts(prompt: string, completion: string): TokenCount {
    const promptTokens = Math.ceil(prompt.length / this.CHARS_PER_TOKEN);
    const completionTokens = Math.ceil(completion.length / this.CHARS_PER_TOKEN);
    
    return {
      promptTokens,
      completionTokens,
      totalTokens: promptTokens + completionTokens
    };
  }

  static truncateToFit(text: string, maxTokens: number): string {
    const currentTokens = Math.ceil(text.length / this.CHARS_PER_TOKEN);
    
    if (currentTokens <= maxTokens) {
      return text;
    }

    const maxChars = maxTokens * this.CHARS_PER_TOKEN;
    const truncated = text.slice(0, maxChars);
    
    logger.warn(`Text truncated from ${currentTokens} to ${maxTokens} tokens`);
    
    return truncated;
  }

  static estimateTokens(text: string): number {
    return Math.ceil(text.length / this.CHARS_PER_TOKEN);
  }
}
