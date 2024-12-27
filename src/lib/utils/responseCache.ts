import { logger } from '../../utils/logger';
import type { ModelResponse } from '../api/modelClients';

interface CacheEntry {
  response: ModelResponse;
  timestamp: number;
  expiresAt: number;
}

interface CacheConfig {
  ttl: number;  // Time to live in milliseconds
  maxSize: number;  // Maximum number of entries
}

export class ResponseCache {
  private cache: Map<string, CacheEntry>;
  private config: CacheConfig;

  constructor(config: Partial<CacheConfig> = {}) {
    this.cache = new Map();
    this.config = {
      ttl: 1000 * 60 * 60, // 1 hour default TTL
      maxSize: 1000,       // Default max size
      ...config
    };
  }

  private generateKey(prompt: string, modelName: string, options: any): string {
    const sortedOptions = Object.keys(options).sort().reduce((acc, key) => {
      acc[key] = options[key];
      return acc;
    }, {} as any);

    return JSON.stringify({
      prompt,
      modelName,
      options: sortedOptions
    });
  }

  private isExpired(entry: CacheEntry): boolean {
    return Date.now() > entry.expiresAt;
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (this.isExpired(entry)) {
        this.cache.delete(key);
      }
    }
  }

  set(prompt: string, modelName: string, options: any, response: ModelResponse): void {
    this.cleanup();

    // If cache is full, remove oldest entries
    if (this.cache.size >= this.config.maxSize) {
      const entries = Array.from(this.cache.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      const entriesToRemove = entries.slice(0, Math.ceil(this.config.maxSize * 0.1)); // Remove 10% of entries
      entriesToRemove.forEach(([key]) => this.cache.delete(key));
    }

    const key = this.generateKey(prompt, modelName, options);
    this.cache.set(key, {
      response,
      timestamp: Date.now(),
      expiresAt: Date.now() + this.config.ttl
    });

    logger.debug(`Cached response for key: ${key.substring(0, 50)}...`);
  }

  get(prompt: string, modelName: string, options: any): ModelResponse | null {
    this.cleanup();
    
    const key = this.generateKey(prompt, modelName, options);
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    if (this.isExpired(entry)) {
      this.cache.delete(key);
      return null;
    }

    logger.debug(`Cache hit for key: ${key.substring(0, 50)}...`);
    return entry.response;
  }

  clear(): void {
    this.cache.clear();
    logger.info('Response cache cleared');
  }

  getStats(): { size: number; maxSize: number; ttl: number } {
    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      ttl: this.config.ttl
    };
  }
}
