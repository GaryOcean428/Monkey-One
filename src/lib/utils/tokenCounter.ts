import { encode } from 'gpt-tokenizer';

export interface TokenCount {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export class TokenCounter {
  static countTokens(text: string): number {
    return encode(text).length;
  }

  static getTokenCounts(prompt: string, completion: string): TokenCount {
    const promptTokens = this.countTokens(prompt);
    const completionTokens = this.countTokens(completion);
    
    return {
      promptTokens,
      completionTokens,
      totalTokens: promptTokens + completionTokens
    };
  }

  static validateContextLength(text: string, maxContext: number): boolean {
    const tokens = this.countTokens(text);
    return tokens <= maxContext;
  }
}
