import { BaseProvider } from './BaseProvider';
import { LocalProvider } from './LocalProvider';
import { logger } from '../../utils/logger';

export class ProviderRegistry {
  private static instance: ProviderRegistry;
  private providers: Map<string, BaseProvider> = new Map();

  private constructor() {
    this.registerDefaultProviders();
  }

  static getInstance(): ProviderRegistry {
    if (!ProviderRegistry.instance) {
      ProviderRegistry.instance = new ProviderRegistry();
    }
    return ProviderRegistry.instance;
  }

  private async registerDefaultProviders() {
    try {
      // Register local provider
      const localProvider = new LocalProvider();
      await localProvider.initialize();
      this.providers.set(localProvider.getName(), localProvider);
      logger.info(`Registered provider: ${localProvider.getName()}`);
    } catch (error) {
      logger.error('Error registering default providers:', error);
      throw error;
    }
  }

  async getProvider(name: string): Promise<BaseProvider> {
    const provider = this.providers.get(name);
    if (!provider) {
      throw new Error(`Provider ${name} not found`);
    }

    // Ensure provider is available
    const isAvailable = await provider.isAvailable();
    if (!isAvailable) {
      throw new Error(`Provider ${name} is not available`);
    }

    return provider;
  }

  registerProvider(provider: BaseProvider) {
    this.providers.set(provider.getName(), provider);
    logger.info(`Registered provider: ${provider.getName()}`);
  }

  unregisterProvider(name: string) {
    if (this.providers.delete(name)) {
      logger.info(`Unregistered provider: ${name}`);
    }
  }

  getAvailableProviders(): string[] {
    return Array.from(this.providers.keys());
  }

  async getAvailableProviderInstances(): Promise<BaseProvider[]> {
    const availableProviders: BaseProvider[] = [];
    
    for (const provider of this.providers.values()) {
      try {
        if (await provider.isAvailable()) {
          availableProviders.push(provider);
        }
      } catch (error) {
        logger.warn(`Error checking provider availability: ${provider.getName()}`, error);
      }
    }

    return availableProviders;
  }
}
