import { Pinecone } from '@pinecone-database/pinecone';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import type { CodeInsight, LearningMetric } from '@/types';

export class VectorStoreManager {
  private pinecone: Pinecone;
  private readonly PINECONE_INDEX = 'monkey-one';
  private readonly CACHE_TTL = 300000; // 5 minutes
  private cache: Map<string, { data: any; timestamp: number }> = new Map();

  constructor() {
    this.pinecone = new Pinecone({
      apiKey: import.meta.env.VITE_PINECONE_API_KEY
    });

    // Start cache cleanup interval
    setInterval(() => this.cleanupCache(), 60000);
  }

  private cleanupCache() {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.CACHE_TTL) {
        this.cache.delete(key);
      }
    }
  }

  async storeVector(vector: number[], metadata: Record<string, any>, namespace?: string) {
    const index = this.pinecone.index(this.PINECONE_INDEX);
    
    // Store in Pinecone
    await index.upsert([{
      id: crypto.randomUUID(),
      values: vector,
      metadata
    }], namespace);

    // Store reference in Firebase
    await addDoc(collection(db, 'vectorStore'), {
      metadata,
      timestamp: Date.now(),
      namespace
    });
  }

  async findSimilar(vector: number[], options?: {
    namespace?: string;
    topK?: number;
    minScore?: number;
    filter?: Record<string, any>;
  }) {
    const cacheKey = `similar:${vector.join(',')}:${JSON.stringify(options)}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }

    const index = this.pinecone.index(this.PINECONE_INDEX);
    
    const results = await index.query({
      vector,
      namespace: options?.namespace,
      topK: options?.topK || 10,
      filter: options?.filter,
      includeMetadata: true
    });

    // Filter by score if needed
    const filtered = options?.minScore 
      ? results.matches.filter(match => match.score >= options.minScore)
      : results.matches;

    // Cache results
    this.cache.set(cacheKey, {
      data: filtered,
      timestamp: Date.now()
    });

    return filtered;
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

  async deleteOldVectors(cutoffDate: number) {
    const index = this.pinecone.index(this.PINECONE_INDEX);
    
    // Delete old vectors from Pinecone
    await index.delete({
      filter: {
        timestamp: { $lt: cutoffDate }
      }
    });

    // Clean up Firebase references
    const q = query(
      collection(db, 'vectorStore'), 
      where('timestamp', '<', cutoffDate)
    );
    
    const snapshot = await getDocs(q);
    snapshot.forEach(async (doc) => {
      await doc.ref.delete();
    });
  }
}

export const vectorStore = new VectorStoreManager();