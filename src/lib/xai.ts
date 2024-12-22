import { XAI_CONFIG } from './config';
import { makeAPIRequest, APIError } from './api';
import { StreamProcessor } from './streaming';
import type { XAIMessage, XAIResponse, XAIEmbeddingResponse } from './types';

export class XAIClient {
  constructor(private apiKey: string) {}

  async chat(
    messages: XAIMessage[],
    onProgress?: (content: string) => void
  ): Promise<string> {
    try {
      const response = await fetch(`${XAI_CONFIG.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          messages,
          model: XAI_CONFIG.defaultModel,
          stream: Boolean(onProgress),
          temperature: XAI_CONFIG.temperature,
          max_tokens: XAI_CONFIG.maxTokens,
        }),
      });

      if (!response.ok) {
        throw new APIError(
          'Chat API request failed',
          response.status,
          await response.text()
        );
      }

      if (onProgress) {
        const reader = response.body?.getReader();
        if (!reader) throw new APIError('Stream not available');

        const processor = new StreamProcessor(onProgress);
        await processor.processStream(reader);
        return '';
      }

      const data: XAIResponse = await response.json();
      return data.choices[0]?.message?.content || '';
    } catch (error) {
      if (error instanceof APIError) throw error;
      throw new APIError(
        error instanceof Error ? error.message : 'Chat request failed'
      );
    }
  }

  async createEmbeddings(input: string | string[]): Promise<number[][]> {
    try {
      const response = await makeAPIRequest<XAIEmbeddingResponse>(
        '/embeddings',
        this.apiKey,
        {
          input,
          model: XAI_CONFIG.defaultModel,
          encoding_format: 'float',
        }
      );

      return response.data.map(item => item.embedding);
    } catch (error) {
      if (error instanceof APIError) {
        throw new APIError(
          `Embeddings request failed: ${error.response || error.message}`,
          error.status
        );
      }
      throw new APIError('Failed to create embeddings');
    }
  }
}

export const createSystemMessage = (): XAIMessage => ({
  role: 'system',
  content: `You are Monkey One, an AI assistant powered by Grok. You have access to:
  - Memory storage and retrieval
  - Code execution
  - File operations
  - Semantic search via embeddings
  
  Guidelines:
  1. Use your memory to maintain context and refer to past interactions
  2. When relevant, mention specific past interactions or knowledge
  3. Learn from past interactions to improve future responses
  4. Be consistent with previous responses and decisions
  5. If you contradict past information, acknowledge and explain why
  
  Commands:
  - 'search [query]': Search memory for relevant information
  - 'memory': Show recent memories
  - 'exec [code]': Execute JavaScript code
  
  Always strive to provide accurate, helpful responses while maintaining context from your memory.`
});