import { Pinecone } from '@pinecone-database/pinecone';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import type { CodeInsight, LearningMetric } from '../../types';
import { monitoring } from '../monitoring/MonitoringSystem';
import { retry } from '../utils/retry';

export class VectorStoreManager {
  private pinecone: Pinecone;
  private readonly PINECONE_INDEX = 'monkey-one';
  private readonly CACHE_TTL = 300000; // 5 minutes
  private readonly BATCH_SIZE = 100;
  private readonly MAX_RETRIES = 3;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();

  constructor() {
    this.pinecone = new Pinecone({
      apiKey: import.meta.env.VITE_PINECONE_API_KEY,
      environment: import.meta.env.VITE_PINECONE_ENVIRONMENT
    });

    // Start cache cleanup interval
    setInterval(() => this.cleanupCache(), 60000);
    
    // Start metrics collection
    setInterval(() => this.collectMetrics(), 300000);
  }

  private async collectMetrics() {
    monitoring.recordMetric('vector_store_cache_size', this.cache.size);
    const indexStats = await this.pinecone.describeIndex(this.PINECONE_INDEX);
    monitoring.recordMetric('vector_store_total_vectors', indexStats.totalVectorCount);
  }

  async storeVector(vector: number[], metadata: Record<string, any>, namespace?: string) {
    const startTime = Date.now();
    try {
      await retry(async () => {
        await this.pinecone.upsert({
          indexName: this.PINECONE_INDEX,
          vectors: [{
            id: crypto.randomUUID(),
            values: vector,
            metadata
          }],
          namespace
        });
      }, this.MAX_RETRIES);
      
      monitoring.recordVectorOperation('store', Date.now() - startTime);
    } catch (error) {
      monitoring.recordError('vector_store', 'store_failed');
      throw error;
    }
  }

  async storeVectorsBatch(vectors: Array<{ vector: number[]; metadata: Record<string, any> }>, namespace?: string) {
    const startTime = Date.now();
    try {
      for (let i = 0; i < vectors.length; i += this.BATCH_SIZE) {
        const batch = vectors.slice(i, i + this.BATCH_SIZE);
        await retry(async () => {
          await this.pinecone.upsert({
            indexName: this.PINECONE_INDEX,
            vectors: batch.map(v => ({
              id: crypto.randomUUID(),
              values: v.vector,
              metadata: v.metadata
            })),
            namespace
          });
        }, this.MAX_RETRIES);
      }
      
      monitoring.recordVectorOperation('batch_store', Date.now() - startTime);
    } catch (error) {
      monitoring.recordError('vector_store', 'batch_store_failed');
      throw error;
    }
  }

  async findSimilar(vector: number[], options?: {
    namespace?: string;
    topK?: number;
    minScore?: number;
    filter?: Record<string, any>;
  }) {
    const startTime = Date.now();
    const cacheKey = this.getCacheKey(vector, options);
    
    try {
      // Check cache first
      const cached = this.cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
        monitoring.recordVectorOperation('cache_hit', Date.now() - startTime);
        return cached.data;
      }

      const results = await retry(async () => {
        return await this.pinecone.query({
          indexName: this.PINECONE_INDEX,
          vector,
          topK: options?.topK || 10,
          namespace: options?.namespace,
          filter: options?.filter,
          includeMetadata: true
        });
      }, this.MAX_RETRIES);

      // Filter by minimum score if specified
      const filtered = options?.minScore
        ? results.matches.filter(m => m.score >= options.minScore)
        : results.matches;

      // Cache results
      this.cache.set(cacheKey, {
        data: filtered,
        timestamp: Date.now()
      });

      monitoring.recordVectorOperation('query', Date.now() - startTime);
      return filtered;
    } catch (error) {
      monitoring.recordError('vector_store', 'query_failed');
      throw error;
    }
  }

  private getCacheKey(vector: number[], options?: any): string {
    return JSON.stringify({
      vector: vector.slice(0, 10), // Use first 10 dimensions for cache key
      options
    });
  }

  async deleteOldVectors(cutoffDate: number, namespace?: string) {
    const startTime = Date.now();
    try {
      await retry(async () => {
        await this.pinecone.delete({
          indexName: this.PINECONE_INDEX,
          filter: {
            timestamp: { $lt: cutoffDate }
          },
          namespace
        });
      }, this.MAX_RETRIES);

      monitoring.recordVectorOperation('delete_old', Date.now() - startTime);
    } catch (error) {
      monitoring.recordError('vector_store', 'delete_failed');
      throw error;
    }
  }

  async storeCodeInsight(insight: CodeInsight, embedding: number[]) {
    await this.storeVector(embedding, {
      type: 'code-insight',
      ...insight
    }, 'insights');
  }

  async findSimilarInsights(embedding: number[], options?: {
    type?: string;
    confidence?: number;
    limit?: number;
  }): Promise<CodeInsight[]> {
    const filter: Record<string, any> = {
      type: 'code-insight'
    };

    if (options?.type) {
      filter.insightType = options.type;
    }
    if (options?.confidence) {
      filter.confidence = { $gte: options.confidence };
    }

    const results = await this.findSimilar(embedding, {
      namespace: 'insights',
      topK: options?.limit || 10,
      filter
    });

    return results.map(match => match.metadata as CodeInsight);
  }

  async storeLearningMetrics(metrics: LearningMetric[], embedding: number[]) {
    await this.storeVector(embedding, {
      type: 'learning-metrics',
      metrics
    }, 'learning');
  }

  async findSimilarLearningPatterns(embedding: number[], limit: number = 5) {
    const results = await this.findSimilar(embedding, {
      namespace: 'learning',
      topK: limit,
      filter: { type: 'learning-metrics' }
    });

    return results.map(match => match.metadata.metrics as LearningMetric[]);
  }

  private cleanupCache() {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.CACHE_TTL) {
        this.cache.delete(key);
      }
    }
  }
}

export const vectorStore = new VectorStoreManager();