import { initPinecone } from '../pinecone/config';
import { Vector } from '@pinecone-database/pinecone';
import type { CodeInsight, LearningMetric } from '../../types';
import { monitoring } from '../monitoring/MonitoringSystem';

export class VectorStoreManager {
  private static instance: VectorStoreManager;
  private pineconeIndex: Awaited<ReturnType<typeof initPinecone>>['index'] | null = null;

  private constructor() {}

  public static getInstance(): VectorStoreManager {
    if (!VectorStoreManager.instance) {
      VectorStoreManager.instance = new VectorStoreManager();
    }
    return VectorStoreManager.instance;
  }

  async initialize() {
    const { index } = await initPinecone();
    this.pineconeIndex = index;
  }

  async storeVector(vector: number[], metadata: Record<string, any>, namespace?: string) {
    if (!this.pineconeIndex) {
      throw new Error('VectorStore not initialized');
    }

    const startTime = Date.now();
    try {
      await this.pineconeIndex.upsert({
        vectors: [{
          id: crypto.randomUUID(),
          values: vector,
          metadata
        }],
        namespace
      });
      
      monitoring.recordVectorOperation('store', Date.now() - startTime);
    } catch (error) {
      monitoring.recordError('vector_store', 'store_failed');
      throw error;
    }
  }

  async storeVectorsBatch(vectors: Array<{ vector: number[]; metadata: Record<string, any> }>, namespace?: string) {
    if (!this.pineconeIndex) {
      throw new Error('VectorStore not initialized');
    }

    const startTime = Date.now();
    try {
      // Deduplicate vectors
      const uniqueVectors = vectors.filter((v, i, self) =>
        i === self.findIndex(t => 
          t.vector.length === v.vector.length && 
          t.vector.every((val, j) => val === v.vector[j])
        )
      );

      // Process in optimized batch sizes
      const BATCH_SIZE = 100;
      const batchPromises = [];
      for (let i = 0; i < uniqueVectors.length; i += BATCH_SIZE) {
        const batch = uniqueVectors.slice(i, i + BATCH_SIZE);
        const promise = this.pineconeIndex.upsert({
          vectors: batch.map(v => ({
            id: crypto.randomUUID(),
            values: v.vector,
            metadata: v.metadata
          })),
          namespace
        });
        batchPromises.push(promise);

        // Process batches in parallel but with limits
        if (batchPromises.length >= 5) {
          await Promise.all(batchPromises);
          batchPromises.length = 0;
        }
      }

      // Process any remaining batches
      if (batchPromises.length > 0) {
        await Promise.all(batchPromises);
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
    if (!this.pineconeIndex) {
      throw new Error('VectorStore not initialized');
    }

    const startTime = Date.now();
    try {
      const results = await this.pineconeIndex.query({
        queryRequest: {
          vector,
          topK: options?.topK || 10,
          namespace: options?.namespace,
          filter: options?.filter,
          includeMetadata: true
        },
      });

      // Filter by minimum score if specified
      const filtered = options?.minScore
        ? results.matches.filter(m => m.score >= options.minScore)
        : results.matches;

      monitoring.recordVectorOperation('query', Date.now() - startTime);
      return filtered;
    } catch (error) {
      monitoring.recordError('vector_store', 'query_failed');
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
}

export const vectorStore = VectorStoreManager.getInstance();