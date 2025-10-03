import { getRedisClient } from '../../redis/config'

export class LRUCache {
  private readonly namespace: string
  private readonly maxSize: number

  constructor(namespace: string, maxSize: number = 1000) {
    this.namespace = namespace
    this.maxSize = maxSize
  }

  private getKey(key: string): string {
    return `lru:${this.namespace}:${key}`
  }

  private async getListKey(): Promise<string> {
    return `lru:${this.namespace}:list`
  }

  async get<T>(key: string): Promise<T | null> {
    const redis = await getRedisClient()
    const cacheKey = this.getKey(key)
    const listKey = await this.getListKey()

    const value = await redis.get(cacheKey)
    if (value) {
      // Move to front of list (most recently used)
      await redis.lRem(listKey, 0, key)
      await redis.lPush(listKey, key)
      return JSON.parse(value)
    }
    return null
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    const redis = await getRedisClient()
    const cacheKey = this.getKey(key)
    const listKey = await this.getListKey()

    // Add to cache with optional TTL
    if (ttl) {
      await redis.set(cacheKey, JSON.stringify(value), { EX: ttl })
    } else {
      await redis.set(cacheKey, JSON.stringify(value))
    }

    // Add to front of list
    await redis.lRem(listKey, 0, key)
    await redis.lPush(listKey, key)

    // Maintain max size
    const size = await redis.lLen(listKey)
    if (size > this.maxSize) {
      // Remove least recently used
      const lru = await redis.rPop(listKey)
      if (lru) {
        await redis.del(this.getKey(lru))
      }
    }
  }

  async delete(key: string): Promise<void> {
    const redis = await getRedisClient()
    const cacheKey = this.getKey(key)
    const listKey = await this.getListKey()

    await redis.del(cacheKey)
    await redis.lRem(listKey, 0, key)
  }

  async clear(): Promise<void> {
    const redis = await getRedisClient()
    const listKey = await this.getListKey()

    // Get all keys
    const keys = await redis.lRange(listKey, 0, -1)

    // Delete all cache entries
    if (keys.length > 0) {
      await redis.del(keys.map(k => this.getKey(k)))
    }

    // Delete list
    await redis.del(listKey)
  }
}
