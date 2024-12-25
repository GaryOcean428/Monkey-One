import { BaseProvider } from './BaseProvider';
import { LocalModelClient } from '../local/localModelClient';
import { TokenCounter } from '../utils/tokenCounter';
import { logger } from '../../utils/logger';
import type { ModelConfig } from '../models';

export class LocalProvider extends BaseProvider {
  private modelClient: LocalModelClient;

  constructor() {
    super('local');
    this.modelClient = new LocalModelClient();
  }

  async initialize(): Promise<void> {
    try {
      await this.modelClient.isReady();
      logger.info('Local provider initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize local provider:', error);
      throw error;
    }
  }

  async generate(prompt: string, config: ModelConfig, options: any = {}): Promise<string> {
    if (!TokenCounter.validateContextLength(prompt, config.contextWindow)) {
      throw new Error(`Prompt exceeds maximum context length of ${config.contextWindow} tokens`);
    }

    const response = await this.modelClient.generate(prompt, options);
    return response.text;
  }

  async *generateStream(prompt: string, config: ModelConfig, options: any = {}): AsyncGenerator<string> {
    if (!TokenCounter.validateContextLength(prompt, config.contextWindow)) {
      throw new Error(`Prompt exceeds maximum context length of ${config.contextWindow} tokens`);
    }

    for await (const chunk of this.modelClient.generateStream(prompt, options)) {
      if (!chunk.done) {
        yield chunk.text;
      }
    }
  }

  async isAvailable(): Promise<boolean> {
    return this.modelClient.isReady();
  }
}
