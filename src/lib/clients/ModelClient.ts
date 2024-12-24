import { LocalModelService } from '../llm/LocalModelService';
import { logger } from '../utils/logger';

type ModelProvider = 'phi' | 'groq' | 'perplexity' | 'xai' | 'qwen';

interface ModelClientConfig {
  defaultProvider?: ModelProvider;
  fallbackProviders?: ModelProvider[];
  maxRetries?: number;
}

export class ModelClient {
  private modelService: LocalModelService;
  private currentProvider: ModelProvider;
  private fallbackProviders: ModelProvider[];
  private maxRetries: number;

  constructor(config: ModelClientConfig = {}) {
    this.modelService = LocalModelService.getInstance();
    this.currentProvider = config.defaultProvider || 'phi';
    this.fallbackProviders = config.fallbackProviders || ['groq', 'perplexity', 'xai', 'qwen'];
    this.maxRetries = config.maxRetries || 3;
  }

  private async callExternalAPI(endpoint: string, data: any) {
    const response = await fetch(`/api/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  private async useLocalModel(prompt: string) {
    try {
      return await this.modelService.generate(prompt);
    } catch (error) {
      logger.error('Local model error:', error);
      throw error;
    }
  }

  private async withFallback<T>(operation: (provider: ModelProvider) => Promise<T>): Promise<T> {
    let lastError: Error | null = null;
    const providers = [this.currentProvider, ...this.fallbackProviders];

    for (let i = 0; i < this.maxRetries; i++) {
      for (const provider of providers) {
        try {
          return await operation(provider);
        } catch (error) {
          lastError = error as Error;
          logger.warn(`Failed to use provider ${provider}:`, error);
          continue;
        }
      }
    }

    throw lastError || new Error('All providers failed');
  }

  async chat(messages: Array<{ role: string; content: string }>) {
    return this.withFallback(async (provider) => {
      if (provider === 'phi') {
        const prompt = messages
          .map(msg => `${msg.role}: ${msg.content}`)
          .join('\n');
        return this.useLocalModel(prompt);
      }

      // External API calls for other providers
      const response = await this.callExternalAPI('chat', {
        provider,
        messages
      });
      return response.content;
    });
  }

  async complete(prompt: string) {
    return this.withFallback(async (provider) => {
      if (provider === 'phi') {
        return this.useLocalModel(prompt);
      }

      // External API calls for other providers
      const response = await this.callExternalAPI('complete', {
        provider,
        prompt
      });
      return response.completion;
    });
  }

  async isReady(): Promise<boolean> {
    if (this.currentProvider === 'phi') {
      return this.modelService.isInitialized();
    }
    return true;
  }

  setProvider(provider: ModelProvider) {
    this.currentProvider = provider;
  }

  getCurrentProvider(): ModelProvider {
    return this.currentProvider;
  }
}