import { BaseProvider } from './BaseProvider.js';
import { logger } from '../../utils/logger.js';
import type { ModelResponse, StreamChunk } from '../types/models.js';

export class LocalProvider extends BaseProvider {
  constructor() {
    super('local');
  }

  async initialize(): Promise<void> {
    try {
      // Initialize local model resources
      logger.info('Local provider initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize local provider:', error);
      throw error;
    }
  }

  async generate(prompt: string, options?: any): Promise<ModelResponse> {
    try {
      // Estimate token count
      const estimatedTokens = Math.ceil(prompt.length / 4);
      
      return {
        text: `Local response to: ${prompt}`,
        usage: {
          promptTokens: estimatedTokens,
          completionTokens: estimatedTokens,
          totalTokens: estimatedTokens * 2
        }
      };
    } catch (error) {
      logger.error('Error in local provider generate:', error);
      throw error;
    }
  }

  async* generateStream(prompt: string, options?: any): AsyncGenerator<StreamChunk> {
    try {
      // Simulate streaming response
      const words = prompt.split(' ');
      
      for (const word of words) {
        yield {
          text: word + ' ',
          done: false
        };
        await new Promise(resolve => setTimeout(resolve, 50)); // Add small delay between words
      }

      yield {
        text: '',
        done: true
      };
    } catch (error) {
      logger.error('Error in local provider stream:', error);
      throw error;
    }
  }

  async isAvailable(): Promise<boolean> {
    return true;
  }
}
