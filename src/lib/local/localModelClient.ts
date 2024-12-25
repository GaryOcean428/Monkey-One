import { LocalModelService } from '../llm/LocalModelService';
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
  private modelService: LocalModelService;
  private maxContextLength: number;

  constructor() {
    this.modelService = LocalModelService.getInstance();
    this.maxContextLength = 128000; // Phi-3.5's context window
  }

  private async validateInput(prompt: string): Promise<void> {
    if (!TokenCounter.validateContextLength(prompt, this.maxContextLength)) {
      throw new Error(`Prompt exceeds maximum context length of ${this.maxContextLength} tokens`);
    }
  }

  async generate(prompt: string, options: LocalModelOptions): Promise<LocalModelResponse> {
    try {
      await this.validateInput(prompt);
      
      // Ensure model is initialized
      await this.modelService.initialize();
      
      const startTime = performance.now();
      const response = await this.modelService.generate(prompt, options);
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
    const modelInfo = this.modelService.getModelInfo();
    return modelInfo.status === 'ready';
  }
}
