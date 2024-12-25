import { BaseProvider } from '@/lib/providers/BaseProvider';
import { logger } from '@/utils/logger';

export class ProviderRegistry {
  private static instance: ProviderRegistry;
  private providers: Map<string, BaseProvider>;
  private initializationPromises: Map<string, Promise<void>>;

  private constructor() {
    this.providers = new Map();
    this.initializationPromises = new Map();
  }

  static getInstance(): ProviderRegistry {
    if (!ProviderRegistry.instance) {
      ProviderRegistry.instance = new ProviderRegistry();
    }
    return ProviderRegistry.instance;
  }

  async registerProvider(name: string, provider: BaseProvider): Promise<void> {
    try {
      if (this.providers.has(name)) {
        throw new Error(`Provider ${name} is already registered`);
      }

      // Store the initialization promise
      const initPromise = provider.initialize();
      this.initializationPromises.set(name, initPromise);

      // Wait for initialization to complete
      await initPromise;

      // Only store the provider if initialization succeeds
      this.providers.set(name, provider);
      logger.info(`Provider ${name} registered successfully`);
    } catch (error) {
      this.initializationPromises.delete(name);
      logger.error(`Failed to register provider ${name}:`, error);
      throw error;
    }
  }

  async getProvider(name: string): Promise<BaseProvider> {
    // Wait for initialization if it's still pending
    const initPromise = this.initializationPromises.get(name);
    if (initPromise) {
      await initPromise;
    }

    const provider = this.providers.get(name);
    if (!provider) {
      throw new Error(`Provider ${name} not found`);
    }

    try {
      const isAvailable = await provider.isAvailable();
      if (!isAvailable) {
        throw new Error(`Provider ${name} is not available`);
      }
      return provider;
    } catch (error) {
      logger.error(`Error checking provider ${name} availability:`, error);
      throw error;
    }
  }

  async getAvailableProviders(): Promise<string[]> {
    const availableProviders: string[] = [];
    
    for (const [name, provider] of this.providers.entries()) {
      try {
        if (await provider.isAvailable()) {
          availableProviders.push(name);
        }
      } catch (error) {
        logger.warn(`Error checking availability for provider ${name}:`, error);
      }
    }
    
    return availableProviders;
  }

  hasProvider(name: string): boolean {
    return this.providers.has(name);
  }

  clearProviders(): void {
    this.providers.clear();
    this.initializationPromises.clear();
  }
}
