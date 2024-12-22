import { PineconeStore } from './PineconeStore';
import type { CodeInsight, LearningMetric } from '@/types';

class VectorStoreManager {
  private store: PineconeStore;
  private cache: Map<string, any> = new Map();
  private readonly CACHE_TTL = 300000; // 5 minutes

  constructor() {
    this.store = new PineconeStore();
    this.startCacheCleanup();
  }

  private startCacheCleanup() {
    setInterval(() => {
      const now = Date.now();
      for (const [key, value] of this.cache.entries()) {
        if (now - value.timestamp > this.CACHE_TTL) {
          this.cache.delete(key);
        }
      }
    }, 60000); // Clean up every minute
  }

  async storeInsight(insight: CodeInsight, embedding: number[]) {
    await this.store.storeCodeInsight(insight, embedding);
    this.invalidateCache('insights');
  }

  async findSimilarInsights(embedding: number[], options?: {
    type?: string;
    confidence?: number;
    limit?: number;
    useCache?: boolean;
  }): Promise<CodeInsight[]> {
    const cacheKey = `insights-${options?.type}-${options?.confidence}-${options?.limit}`;
    
    if (options?.useCache && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.CACHE_TTL) {
        return cached.data;
      }
    }

    const results = await this.store.findSimilarInsights(embedding, options);
    
    if (options?.useCache) {
      this.cache.set(cacheKey, {
        data: results,
        timestamp: Date.now()
      });
    }

    return results;
  }

  async storeLearningMetrics(metrics: LearningMetric[], embedding: number[]) {
    await this.store.storeLearningMetrics(metrics, embedding);
    this.invalidateCache('metrics');
  }

  async findSimilarLearningPatterns(embedding: number[], limit?: number) {
    const cacheKey = `learning-patterns-${limit}`;
    
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.CACHE_TTL) {
        return cached.data;
      }
    }

    const results = await this.store.findSimilarLearningPatterns(embedding, limit);
    
    this.cache.set(cacheKey, {
      data: results,
      timestamp: Date.now()
    });

    return results;
  }

  private invalidateCache(prefix: string) {
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
      }
    }
  }

  async cleanup(retentionDays: number = 30) {
    const cutoffDate = Date.now() - (retentionDays * 24 * 60 * 60 * 1000);
    await this.store.deleteOldInsights(cutoffDate);
    this.cache.clear();
  }
}

export const vectorStore = new VectorStoreManager();