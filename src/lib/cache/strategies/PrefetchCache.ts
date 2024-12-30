import { getRedisClient } from '../../redis/config';

type PrefetchRule = {
  pattern: RegExp;
  related: (key: string) => Promise<string[]>;
};

export class PrefetchCache {
  private readonly namespace: string;
  private readonly rules: PrefetchRule[];
  private readonly ttl: number;

  constructor(namespace: string, rules: PrefetchRule[], ttl: number = 300) {
    this.namespace = namespace;
    this.rules = rules;
    this.ttl = ttl;
  }

  private getKey(key: string): string {
    return `prefetch:${this.namespace}:${key}`;
  }

  private async prefetchRelated(key: string): Promise<void> {
    // Find matching rule
    const rule = this.rules.find(r => r.pattern.test(key));
    if (!rule) return;

    // Get related keys
    const relatedKeys = await rule.related(key);
    if (relatedKeys.length === 0) return;

    // Prefetch in background
    this.prefetchKeys(relatedKeys).catch(console.error);
  }

  private async prefetchKeys(keys: string[]): Promise<void> {
    const redis = await getRedisClient();
    const pipeline = redis.multi();

    for (const key of keys) {
      const cacheKey = this.getKey(key);
      pipeline.get(cacheKey);
    }

    const results = await pipeline.exec();
    if (!results) return;

    // Process results and update prefetch metadata
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const value = results[i];
      if (value) {
        await this.updatePrefetchMetadata(key);
      }
    }
  }

  private async updatePrefetchMetadata(key: string): Promise<void> {
    const redis = await getRedisClient();
    const metaKey = `${this.getKey(key)}:meta`;
    
    const now = Date.now();
    await redis.hSet(metaKey, {
      lastPrefetch: now.toString(),
      prefetchCount: await redis.hIncrBy(metaKey, 'prefetchCount', 1),
    });
  }

  async get<T>(key: string): Promise<T | null> {
    const redis = await getRedisClient();
    const cacheKey = this.getKey(key);

    const value = await redis.get(cacheKey);
    if (value) {
      // Trigger prefetch of related items
      this.prefetchRelated(key).catch(console.error);
      return JSON.parse(value);
    }
    return null;
  }

  async set<T>(key: string, value: T): Promise<void> {
    const redis = await getRedisClient();
    const cacheKey = this.getKey(key);

    await redis.set(cacheKey, JSON.stringify(value), {
      EX: this.ttl
    });
  }

  async delete(key: string): Promise<void> {
    const redis = await getRedisClient();
    const cacheKey = this.getKey(key);
    const metaKey = `${cacheKey}:meta`;

    await redis.del(cacheKey, metaKey);
  }

  async clear(): Promise<void> {
    const redis = await getRedisClient();
    const keys = await redis.keys(`prefetch:${this.namespace}:*`);
    if (keys.length > 0) {
      await redis.del(keys);
    }
  }

  async getPrefetchStats(key: string): Promise<{
    lastPrefetch: number;
    prefetchCount: number;
  } | null> {
    const redis = await getRedisClient();
    const metaKey = `${this.getKey(key)}:meta`;

    const meta = await redis.hGetAll(metaKey);
    if (!meta.lastPrefetch) return null;

    return {
      lastPrefetch: parseInt(meta.lastPrefetch),
      prefetchCount: parseInt(meta.prefetchCount || '0'),
    };
  }
}
