import { ProviderRegistry } from './providers/ProviderRegistry.js';
import { LocalProvider } from './providers/LocalProvider.js';
import { logger } from '../utils/logger.js';
import { analytics } from './monitoring/analytics.js';
import { performanceMonitor } from './monitoring/performance.js';
import type { ModelResponse, StreamChunk } from './types/models.js';

interface LLMManagerConfig {
  defaultProvider?: string;
  maxRetries?: number;
  timeout?: number;
}

class LLMManager {
  private static instance: LLMManager;
  private providerRegistry: ProviderRegistry;
  private config: LLMManagerConfig;

  constructor(config: LLMManagerConfig = {}) {
    this.config = {
      defaultProvider: 'local',
      maxRetries: 3,
      timeout: 30000,
      ...config
    };
    this.providerRegistry = ProviderRegistry.getInstance();
    this.registerDefaultProviders();
  }

  private async registerDefaultProviders() {
    try {
      const localProvider = new LocalProvider();
      await this.providerRegistry.registerProvider('local', localProvider);
      logger.info('Default providers registered successfully');
    } catch (error) {
      logger.error('Error registering default providers:', error);
      throw error;
    }
  }

  static getInstance(config?: LLMManagerConfig): LLMManager {
    if (!LLMManager.instance) {
      LLMManager.instance = new LLMManager(config);
    }
    return LLMManager.instance;
  }

  async getProvider(name: string = this.config.defaultProvider!) {
    try {
      return await this.providerRegistry.getProvider(name);
    } catch (error) {
      logger.error(`Error getting provider ${name}:`, error);
      throw error;
    }
  }

  async generate(prompt: string, providerName?: string, options: any = {}): Promise<ModelResponse> {
    const provider = await this.getProvider(providerName);
    const startTime = performance.now();

    try {
      const response = await provider.generate(prompt, options);
      const endTime = performance.now();
      const latency = endTime - startTime;

      analytics.recordRequest(providerName || this.config.defaultProvider!, {
        success: true,
        latency,
        tokenUsage: response.usage
      });

      performanceMonitor.recordLatency(providerName || this.config.defaultProvider!, latency);

      return response;
    } catch (error) {
      analytics.recordRequest(providerName || this.config.defaultProvider!, {
        success: false,
        error: error as Error
      });

      logger.error(`Error generating response with provider ${providerName}:`, error);
      throw error;
    }
  }

  async* generateStream(prompt: string, providerName?: string, options: any = {}): AsyncGenerator<StreamChunk> {
    const provider = await this.getProvider(providerName);
    const startTime = performance.now();

    try {
      const stream = provider.generateStream(prompt, options);
      
      for await (const chunk of stream) {
        yield chunk;
      }

      const endTime = performance.now();
      const latency = endTime - startTime;

      analytics.recordRequest(providerName || this.config.defaultProvider!, {
        success: true,
        latency,
        streaming: true
      });

      performanceMonitor.recordLatency(providerName || this.config.defaultProvider!, latency);
    } catch (error) {
      analytics.recordRequest(providerName || this.config.defaultProvider!, {
        success: false,
        error: error as Error,
        streaming: true
      });

      logger.error(`Error in streaming response with provider ${providerName}:`, error);
      throw error;
    }
  }

  async getAvailableProviders(): Promise<string[]> {
    return this.providerRegistry.getAvailableProviders();
  }
}

export const llmManager = LLMManager.getInstance();
export { generateResponse, generateStreamingResponse } from './models.js';
export type { ModelResponse, StreamChunk } from './types/models.js';
