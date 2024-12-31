import { LocalProvider } from '../providers';
import { TokenCounter, TokenCount } from '../utils/tokenCounter';
import { logger } from '../../utils/logger';

export interface LocalModelResponse {
  text: string;
  usage: TokenCount;
}

export interface LocalModelOptions {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
}

export class LocalModelClient {
  private provider: LocalProvider;
  private isInitialized: boolean = false;
  private maxContextLength: number;

  constructor() {
    this.provider = new LocalProvider();
    this.maxContextLength = 128000; // Phi-3.5's context window
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      await this.provider.initialize();
      this.isInitialized = true;
      logger.info('Local model client initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize local model client:', error);
      throw error;
    }
  }

  private async validateInput(prompt: string): Promise<void> {
    if (!TokenCounter.validateContextLength(prompt, this.maxContextLength)) {
      throw new Error(`Prompt exceeds maximum context length of ${this.maxContextLength} tokens`);
    }
  }

  async generate(prompt: string, options: LocalModelOptions): Promise<LocalModelResponse> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      await this.validateInput(prompt);
      
      const startTime = performance.now();
      const response = await this.provider.generateResponse(prompt, options);
      const endTime = performance.now();
      
      logger.info(`Local model inference completed in ${endTime - startTime}ms`);
      
      return {
        text: response,
        usage: TokenCounter.getTokenCounts(prompt, response)
      };
    } catch (error) {
      logger.error('Error in local model generation:', error);
      throw error;
    }
  }

  async isReady(): Promise<boolean> {
    return this.provider.isReady();
  }
}
