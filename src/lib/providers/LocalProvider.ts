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

  async generate(prompt: string, options: any = {}): Promise<ModelResponse> {
    try {
      // Use options for response generation
      const temperature = options.temperature || 0.7;
      const maxTokens = options.maxTokens || 1000;
      
      // Estimate token count
      const estimatedTokens = Math.ceil(prompt.length / 4);
      
      return {
        text: `Local response to: ${prompt} (temp: ${temperature}, maxTokens: ${maxTokens})`,
        usage: {
          promptTokens: estimatedTokens,
          completionTokens: Math.min(estimatedTokens, maxTokens),
          totalTokens: estimatedTokens * 2
        }
      };
    } catch (error) {
      logger.error('Error in local provider generate:', error);
      throw error;
    }
  }

  async* generateStream(prompt: string, options: any = {}): AsyncGenerator<StreamChunk> {
    try {
      // Use options for stream generation
      const temperature = options.temperature || 0.7;
      const streamDelay = options.streamDelay || 50;
      
      // Simulate streaming response
      const words = prompt.split(' ');
      
      yield {
        text: `[temp: ${temperature}] `,
        done: false
      };
      
      for (const word of words) {
        yield {
          text: word + ' ',
          done: false
        };
        await new Promise(resolve => setTimeout(resolve, streamDelay));
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
