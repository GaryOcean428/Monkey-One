import { logger } from '../../utils/logger'

interface RateLimitConfig {
  requestsPerMinute: number
  burstLimit: number
}

interface TokenBucket {
  tokens: number
  lastRefill: number
}

export class RateLimiter {
  private limits: Map<string, RateLimitConfig>
  private buckets: Map<string, TokenBucket>
  private refillRate: number

  constructor() {
    this.limits = new Map([
      ['openai', { requestsPerMinute: 60, burstLimit: 5 }],
      ['anthropic', { requestsPerMinute: 50, burstLimit: 4 }],
      ['perplexity', { requestsPerMinute: 40, burstLimit: 3 }],
      ['groq', { requestsPerMinute: 45, burstLimit: 4 }],
      ['qwen', { requestsPerMinute: 30, burstLimit: 3 }],
      ['local', { requestsPerMinute: 120, burstLimit: 10 }],
    ])
    this.buckets = new Map()
    this.refillRate = 60 * 1000 // 1 minute in milliseconds
  }

  private getTokenBucket(provider: string): TokenBucket {
    if (!this.buckets.has(provider)) {
      const limit = this.limits.get(provider) || this.limits.get('local')!
      this.buckets.set(provider, {
        tokens: limit.burstLimit,
        lastRefill: Date.now(),
      })
    }
    return this.buckets.get(provider)!
  }

  private refillTokens(provider: string): void {
    const bucket = this.getTokenBucket(provider)
    const limit = this.limits.get(provider) || this.limits.get('local')!
    const now = Date.now()
    const timePassed = now - bucket.lastRefill
    const tokensToAdd = Math.floor((timePassed / this.refillRate) * limit.requestsPerMinute)

    if (tokensToAdd > 0) {
      bucket.tokens = Math.min(bucket.tokens + tokensToAdd, limit.burstLimit)
      bucket.lastRefill = now
    }
  }

  async acquireToken(provider: string): Promise<boolean> {
    this.refillTokens(provider)
    const bucket = this.getTokenBucket(provider)

    if (bucket.tokens > 0) {
      bucket.tokens--
      logger.debug(`Rate limit token acquired for ${provider}. Remaining: ${bucket.tokens}`)
      return true
    }

    const limit = this.limits.get(provider) || this.limits.get('local')!
    logger.warn(`Rate limit exceeded for ${provider}. Limit: ${limit.requestsPerMinute}/min`)
    return false
  }

  async waitForToken(provider: string, maxWaitMs: number = 5000): Promise<boolean> {
    const startTime = Date.now()

    while (Date.now() - startTime < maxWaitMs) {
      if (await this.acquireToken(provider)) {
        return true
      }
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    return false
  }

  getLimit(provider: string): RateLimitConfig {
    return this.limits.get(provider) || this.limits.get('local')!
  }

  setLimit(provider: string, config: RateLimitConfig): void {
    this.limits.set(provider, config)
    // Reset bucket for this provider
    this.buckets.delete(provider)
  }
}
