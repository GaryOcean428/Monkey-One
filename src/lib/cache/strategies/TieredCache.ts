import { getRedisClient } from '../../redis/config'

interface CacheTier {
  name: string
  ttl: number
  maxSize?: number
}

export class TieredCache {
  private readonly namespace: string
  private readonly tiers: CacheTier[]

  constructor(namespace: string, tiers: CacheTier[]) {
    this.namespace = namespace
    this.tiers = tiers.sort((a, b) => a.ttl - b.ttl) // Sort by TTL ascending
  }

  private getKey(tier: string, key: string): string {
    return `tiered:${this.namespace}:${tier}:${key}`
  }

  private async promoteToTier(
    key: string,
    value: string,
    fromTier: number,
    toTier: number
  ): Promise<void> {
    const redis = await getRedisClient()
    const fromKey = this.getKey(this.tiers[fromTier].name, key)
    const toKey = this.getKey(this.tiers[toTier].name, key)

    // Add to higher tier
    await redis.set(toKey, value, {
      EX: this.tiers[toTier].ttl,
    })

    // Remove from lower tier
    await redis.del(fromKey)

    // Maintain max size if specified
    if (this.tiers[toTier].maxSize) {
      const pattern = `tiered:${this.namespace}:${this.tiers[toTier].name}:*`
      const tierKeys = await redis.keys(pattern)
      if (tierKeys.length > this.tiers[toTier].maxSize!) {
        // Remove oldest key
        const oldestKey = tierKeys[0]
        const value = await redis.get(oldestKey)
        if (value) {
          // Demote to lower tier
          await redis.set(this.getKey(this.tiers[toTier - 1].name, key), value, {
            EX: this.tiers[toTier - 1].ttl,
          })
        }
        await redis.del(oldestKey)
      }
    }
  }

  async get<T>(key: string): Promise<T | null> {
    const redis = await getRedisClient()

    // Check each tier from highest to lowest
    for (let i = this.tiers.length - 1; i >= 0; i--) {
      const tier = this.tiers[i]
      const cacheKey = this.getKey(tier.name, key)
      const value = await redis.get(cacheKey)

      if (value) {
        // Found in this tier
        if (i < this.tiers.length - 1) {
          // Promote to next tier if not in highest
          await this.promoteToTier(key, value, i, i + 1)
        }
        return JSON.parse(value)
      }
    }

    return null
  }

  async set<T>(key: string, value: T): Promise<void> {
    // Start in lowest tier
    const lowestTier = this.tiers[0]
    const cacheKey = this.getKey(lowestTier.name, key)
    const redis = await getRedisClient()

    await redis.set(cacheKey, JSON.stringify(value), {
      EX: lowestTier.ttl,
    })
  }

  async delete(key: string): Promise<void> {
    const redis = await getRedisClient()

    // Remove from all tiers
    for (const tier of this.tiers) {
      const cacheKey = this.getKey(tier.name, key)
      await redis.del(cacheKey)
    }
  }

  async clear(): Promise<void> {
    const redis = await getRedisClient()
    const keys = await redis.keys(`tiered:${this.namespace}:*`)
    if (keys.length > 0) {
      await redis.del(keys)
    }
  }

  async getTierStats(): Promise<Record<string, { size: number; hitRate: number }>> {
    const redis = await getRedisClient()
    const stats: Record<string, { size: number; hitRate: number }> = {}

    for (const tier of this.tiers) {
      const pattern = `tiered:${this.namespace}:${tier.name}:*`
      const keys = await redis.keys(pattern)
      stats[tier.name] = {
        size: keys.length,
        hitRate: 0, // You would need to implement hit tracking to get this
      }
    }

    return stats
  }
}
