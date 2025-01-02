/* eslint-env browser */
import { PineconeStore } from './PineconeStore'

interface CodeInsight {
  id: string
  type: string
  content: string
  metadata: Record<string, unknown>
}

interface LearningMetric {
  id: string
  metric: string
  value: number
  timestamp: number
  metadata: Record<string, unknown>
}

interface CacheEntry<T> {
  data: T[]
  timestamp: number
}

class VectorStoreManager {
  private store: PineconeStore
  private cache: Map<string, CacheEntry<CodeInsight | LearningMetric>>
  private readonly CACHE_TTL = 300000 // 5 minutes
  private initialized = false

  constructor() {
    this.store = new PineconeStore()
    this.cache = new Map()
    this.startCacheCleanup()
  }

  private startCacheCleanup() {
    if (typeof globalThis !== 'undefined') {
      globalThis.setInterval(() => {
        const now = Date.now()
        for (const [key, value] of this.cache.entries()) {
          if (now - value.timestamp > this.CACHE_TTL) {
            this.cache.delete(key)
          }
        }
      }, 60000) // Clean up every minute
    }
  }

  async initialize(): Promise<void> {
    if (!this.initialized) {
      await this.store.initialize()
      this.initialized = true
    }
  }

  async storeInsight(insight: CodeInsight, embedding: number[]): Promise<void> {
    await this.initialize()
    await this.store.storeCodeInsight(insight, embedding)
    this.invalidateCache('insights')
  }

  async findSimilarInsights(
    embedding: number[],
    options?: {
      type?: string
      confidence?: number
      limit?: number
      useCache?: boolean
    }
  ): Promise<CodeInsight[]> {
    await this.initialize()
    const cacheKey = `insights-${options?.type}-${options?.confidence}-${options?.limit}`

    if (options?.useCache && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)
      if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
        return cached.data as CodeInsight[]
      }
    }

    const results = await this.store.findSimilarInsights(embedding, options)

    if (options?.useCache) {
      this.cache.set(cacheKey, {
        data: results,
        timestamp: Date.now(),
      })
    }

    return results
  }

  async storeLearningMetrics(metrics: LearningMetric[], embedding: number[]): Promise<void> {
    await this.initialize()
    await this.store.storeLearningMetrics(metrics, embedding)
    this.invalidateCache('metrics')
  }

  async findSimilarLearningPatterns(
    embedding: number[],
    limit?: number
  ): Promise<LearningMetric[]> {
    await this.initialize()
    const cacheKey = `learning-patterns-${limit}`

    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)
      if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
        return cached.data as LearningMetric[]
      }
    }

    const results = await this.store.findSimilarLearningPatterns(embedding, limit)

    this.cache.set(cacheKey, {
      data: results,
      timestamp: Date.now(),
    })

    return results
  }

  private invalidateCache(prefix: string): void {
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key)
      }
    }
  }

  async cleanup(retentionDays: number = 30): Promise<void> {
    await this.initialize()
    const cutoffDate = Date.now() - retentionDays * 24 * 60 * 60 * 1000
    await this.store.deleteOldInsights(cutoffDate)
    this.cache.clear()
  }
}

export const vectorStore = new VectorStoreManager()
