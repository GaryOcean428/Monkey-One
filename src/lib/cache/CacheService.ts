import { getRedisClient } from '../redis/config'

export class CacheService {
  private static instance: CacheService
  private readonly DEFAULT_TTL = 300 // 5 minutes in seconds

  private constructor() {}

  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService()
    }
    return CacheService.instance
  }

  async get<T>(key: string): Promise<T | null> {
    const redis = await getRedisClient()
    const value = await redis.get(key)
    return value ? JSON.parse(value) : null
  }

  async set<T>(key: string, value: T, ttl = this.DEFAULT_TTL): Promise<void> {
    const redis = await getRedisClient()
    await redis.set(key, JSON.stringify(value), {
      EX: ttl,
    })
  }

  async delete(key: string): Promise<void> {
    const redis = await getRedisClient()
    await redis.del(key)
  }

  async deletePattern(pattern: string): Promise<void> {
    const redis = await getRedisClient()
    const keys = await redis.keys(pattern)
    if (keys.length > 0) {
      await redis.del(keys)
    }
  }

  async exists(key: string): Promise<boolean> {
    const redis = await getRedisClient()
    return (await redis.exists(key)) > 0
  }

  async increment(key: string): Promise<number> {
    const redis = await getRedisClient()
    return redis.incr(key)
  }

  async decrement(key: string): Promise<number> {
    const redis = await getRedisClient()
    return redis.decr(key)
  }

  async expire(key: string, seconds: number): Promise<boolean> {
    const redis = await getRedisClient()
    return redis.expire(key, seconds)
  }

  async ttl(key: string): Promise<number> {
    const redis = await getRedisClient()
    return redis.ttl(key)
  }

  async clear(): Promise<void> {
    const redis = await getRedisClient()
    await redis.flushDb()
  }

  // List operations
  async listPush(key: string, value: string): Promise<number> {
    const redis = await getRedisClient()
    return redis.lPush(key, value)
  }

  async listPop(key: string): Promise<string | null> {
    const redis = await getRedisClient()
    return redis.lPop(key)
  }

  async listRange(key: string, start: number, stop: number): Promise<string[]> {
    const redis = await getRedisClient()
    return redis.lRange(key, start, stop)
  }

  // Set operations
  async setAdd(key: string, ...members: string[]): Promise<number> {
    const redis = await getRedisClient()
    return redis.sAdd(key, members)
  }

  async setMembers(key: string): Promise<string[]> {
    const redis = await getRedisClient()
    return redis.sMembers(key)
  }

  async setRemove(key: string, ...members: string[]): Promise<number> {
    const redis = await getRedisClient()
    return redis.sRem(key, members)
  }

  // Hash operations
  async hashSet(key: string, field: string, value: string): Promise<number> {
    const redis = await getRedisClient()
    return redis.hSet(key, field, value)
  }

  async hashGet(key: string, field: string): Promise<string | null> {
    const redis = await getRedisClient()
    return redis.hGet(key, field)
  }

  async hashGetAll(key: string): Promise<Record<string, string>> {
    const redis = await getRedisClient()
    return redis.hGetAll(key)
  }

  // Sorted Set operations
  async sortedSetAdd(key: string, score: number, member: string): Promise<number> {
    const redis = await getRedisClient()
    return redis.zAdd(key, { score, value: member })
  }

  async sortedSetRange(key: string, start: number, stop: number): Promise<string[]> {
    const redis = await getRedisClient()
    return redis.zRange(key, start, stop)
  }

  // Cache decorator
  static cache(ttl = 300) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
      const originalMethod = descriptor.value

      descriptor.value = async function (...args: any[]) {
        const cache = CacheService.getInstance()
        const key = `${propertyKey}:${JSON.stringify(args)}`

        const cached = await cache.get(key)
        if (cached !== null) {
          return cached
        }

        const result = await originalMethod.apply(this, args)
        await cache.set(key, result, ttl)
        return result
      }

      return descriptor
    }
  }
}

export const cache = CacheService.getInstance()
