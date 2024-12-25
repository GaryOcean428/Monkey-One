import { ProviderRegistry } from './providers/ProviderRegistry';
import { logger } from '../utils/logger';
import { analytics } from './monitoring/analytics';
import { performanceMonitor } from './monitoring/performance';
import type { ModelConfig } from './models';

export interface LLMManagerConfig {
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

  async generate(prompt: string, providerName?: string, options: any = {}) {
    const provider = await this.getProvider(providerName);
    const startTime = performance.now();

    try {
      const response = await provider.generate(prompt, options);
      
      const endTime = performance.now();
      const latency = endTime - startTime;
      
      // Record metrics
      performanceMonitor.recordMetrics(
        providerName || this.config.defaultProvider!,
        latency,
        response.length / (latency / 1000), // tokens per second
        process.memoryUsage().heapUsed
      );

      analytics.trackEvent('generate', {
        provider: provider.getName(),
        latency,
        success: true
      });

      return response;
    } catch (error) {
      logger.error('Error generating response:', error);
      
      analytics.trackEvent('generate', {
        provider: provider.getName(),
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false
      });

      throw error;
    }
  }

  async *generateStream(prompt: string, providerName?: string, options: any = {}) {
    const provider = await this.getProvider(providerName);
    const startTime = performance.now();
    let totalTokens = 0;

    try {
      for await (const chunk of provider.generateStream(prompt, options)) {
        totalTokens += chunk.length;
        yield chunk;
      }

      const endTime = performance.now();
      const latency = endTime - startTime;
      
      // Record streaming metrics
      performanceMonitor.recordMetrics(
        providerName || this.config.defaultProvider!,
        latency,
        totalTokens / (latency / 1000),
        process.memoryUsage().heapUsed
      );

      analytics.trackEvent('generateStream', {
        provider: provider.getName(),
        latency,
        totalTokens,
        success: true
      });
    } catch (error) {
      logger.error('Error in stream generation:', error);
      
      analytics.trackEvent('generateStream', {
        provider: provider.getName(),
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false
      });

      throw error;
    }
  }

  getAvailableProviders(): Promise<string[]> {
    return Promise.resolve(this.providerRegistry.getAvailableProviders());
  }
}

export const llmManager = LLMManager.getInstance();
export { generateResponse, generateStreamingResponse } from './models';
export type { ModelResponse, StreamChunk } from './api/modelClients';
