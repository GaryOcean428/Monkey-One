import { getRedisClient } from '../../redis/config';

export class SlidingWindowCache {
  private readonly namespace: string;
  private readonly windowSize: number;

  constructor(namespace: string, windowSizeSeconds: number = 300) {
    this.namespace = namespace;
    this.windowSize = windowSizeSeconds;
  }

  private getKey(key: string): string {
    return `sliding:${this.namespace}:${key}`;
  }

  private getScoreKey(key: string): string {
    return `sliding:${this.namespace}:score:${key}`;
  }

  async get<T>(key: string): Promise<T | null> {
    const redis = await getRedisClient();
    const cacheKey = this.getKey(key);
    const scoreKey = this.getScoreKey(key);

    const value = await redis.get(cacheKey);
    if (value) {
      // Update access count and timestamp
      const now = Date.now();
      await redis.zAdd(scoreKey, {
        score: now,
        value: now.toString()
      });

      // Clean old access records
      const cutoff = now - (this.windowSize * 1000);
      await redis.zRemRangeByScore(scoreKey, 0, cutoff);

      return JSON.parse(value);
    }
    return null;
  }

  async set<T>(key: string, value: T): Promise<void> {
    const redis = await getRedisClient();
    const cacheKey = this.getKey(key);
    const scoreKey = this.getScoreKey(key);

    // Store value
    await redis.set(cacheKey, JSON.stringify(value));

    // Record access
    const now = Date.now();
    await redis.zAdd(scoreKey, {
      score: now,
      value: now.toString()
    });

    // Set expiry based on last access
    await redis.expire(cacheKey, this.windowSize);
    await redis.expire(scoreKey, this.windowSize);
  }

  async getAccessPattern(key: string): Promise<number[]> {
    const redis = await getRedisClient();
    const scoreKey = this.getScoreKey(key);

    const now = Date.now();
    const cutoff = now - (this.windowSize * 1000);
    
    // Get all access timestamps in window
    const accesses = await redis.zRangeByScore(scoreKey, cutoff, now);
    return accesses.map(ts => parseInt(ts));
  }

  async delete(key: string): Promise<void> {
    const redis = await getRedisClient();
    const cacheKey = this.getKey(key);
    const scoreKey = this.getScoreKey(key);

    await redis.del(cacheKey, scoreKey);
  }

  async clear(): Promise<void> {
    const redis = await getRedisClient();
    const keys = await redis.keys(`sliding:${this.namespace}:*`);
    if (keys.length > 0) {
      await redis.del(keys);
    }
  }
}
