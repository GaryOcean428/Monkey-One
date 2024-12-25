import { BaseProvider } from './BaseProvider';
import { logger } from '../../utils/logger';

export class ProviderRegistry {
  private static instance: ProviderRegistry;
  private providers: Map<string, BaseProvider> = new Map();

  private constructor() {}

  static getInstance(): ProviderRegistry {
    if (!ProviderRegistry.instance) {
      ProviderRegistry.instance = new ProviderRegistry();
    }
    return ProviderRegistry.instance;
  }

  async registerProvider(name: string, provider: BaseProvider): Promise<void> {
    try {
      await provider.initialize();
      this.providers.set(name, provider);
      logger.info(`Registered provider: ${name}`);
    } catch (error) {
      logger.error(`Error registering provider ${name}:`, error);
      throw error;
    }
  }

  async getProvider(name: string): Promise<BaseProvider> {
    const provider = this.providers.get(name);
    if (!provider) {
      throw new Error(`Provider ${name} not found`);
    }
    return provider;
  }

  async getAvailableProviders(): Promise<string[]> {
    return Array.from(this.providers.keys());
  }

  async hasProvider(name: string): Promise<boolean> {
    return this.providers.has(name);
  }
}
