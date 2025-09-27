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
  private readonly cleanupInterval: number = 1000 * 60 * 5; // Cleanup every 5 minutes
  private cleanupTimer: NodeJS.Timeout | null = null;

  constructor(config: Partial<CacheConfig> = {}) {
    this.cache = new Map();
    this.config = {
      ttl: 1000 * 60 * 60, // 1 hour default TTL
      maxSize: 1000,       // Default max size
      ...config
    };
    
    // Start periodic cleanup
    this.cleanupTimer = setInterval(() => this.cleanup(), this.cleanupInterval);
  }

  private generateKey(cacheKey: string, options: any): string {
    const sortedOptions = Object.keys(options).sort().reduce((acc, key) => {
      acc[key] = options[key];
      return acc;
    }, {} as any);

    return JSON.stringify({
      cacheKey,
      options: sortedOptions
    });
  }

  private isExpired(entry: CacheEntry): boolean {
    return Date.now() > entry.expiresAt;
  }

  private cleanup(): void {
    logger.info('Starting cache cleanup');
    let cleanedCount = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (this.isExpired(entry)) {
        this.cache.delete(key);
        cleanedCount++;
      }
    }
    
    logger.info(`Cleaned up ${cleanedCount} expired cache entries`);
  }

  set(cacheKey: string, options: any, response: ModelResponse): void {
    // If cache is full, remove oldest entries
    if (this.cache.size >= this.config.maxSize) {
      const entries = Array.from(this.cache.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      const entriesToRemove = entries.slice(0, Math.ceil(this.config.maxSize * 0.1)); // Remove 10% of entries
      entriesToRemove.forEach(([key]) => this.cache.delete(key));
    }

    const key = this.generateKey(cacheKey, options);
    this.cache.set(key, {
      response,
      timestamp: Date.now(),
      expiresAt: Date.now() + this.config.ttl
    });

    logger.debug(`Cached response for key: ${key.substring(0, 50)}...`);
  }

  get(cacheKey: string, options: any): ModelResponse | null {
    const key = this.generateKey(cacheKey, options);
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

  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    this.clear();
  }
}
