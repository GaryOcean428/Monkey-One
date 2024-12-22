import { llmManager } from './providers';
import { memoryManager } from '../memory';
import type { Message } from '@/types';

interface ProcessedResponse {
  content: string;
  confidence: number;
  context: {
    relevantMemories: string[];
    topicContinuity: number;
    contextualRelevance: number;
  };
  metadata: {
    processingTime: number;
    tokensUsed: number;
    model: string;
  };
}

export class ResponseProcessor {
  async processResponse(
    userMessage: string,
    context: Message[] = []
  ): Promise<ProcessedResponse> {
    const startTime = Date.now();

    try {
      // Get relevant memories
      const relevantMemories = await memoryManager.search(userMessage, {
        limit: 5,
        useSemanticSearch: true
      });

      // Generate response using LLM
      const response = await llmManager.sendMessage(userMessage, context, {
        useRag: true,
        documents: relevantMemories.map(m => m.content)
      });

      return {
        content: response,
        confidence: 0.9, // This should be calculated based on model output
        context: {
          relevantMemories: relevantMemories.map(m => m.content),
          topicContinuity: 0.8,
          contextualRelevance: 0.9
        },
        metadata: {
          processingTime: Date.now() - startTime,
          tokensUsed: response.length / 4, // Rough estimate
          model: llmManager.getActiveProvider().name
        }
      };
    } catch (error) {
      console.error('Error processing response:', error);
      throw error;
    }
  }
}