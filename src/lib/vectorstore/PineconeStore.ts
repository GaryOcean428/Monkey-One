import { Pinecone } from '@pinecone-database/pinecone';
import type { CodeInsight, LearningMetric } from '@/types';

export class PineconeStore {
  private pc: Pinecone;
  private index: any; // Type will be added when @types/pinecone is available
  private readonly NAMESPACE = 'monkey-one';

  constructor() {
    this.pc = new Pinecone({
      apiKey: import.meta.env.VITE_PINECONE_API_KEY
    });
    this.index = this.pc.index('quickstart');
  }

  async storeCodeInsight(insight: CodeInsight, embedding: number[]) {
    await this.index.namespace(this.NAMESPACE).upsert([{
      id: insight.id,
      values: embedding,
      metadata: {
        type: insight.type,
        path: insight.path,
        description: insight.description,
        confidence: insight.confidence,
        timestamp: Date.now()
      }
    }]);
  }

  async findSimilarInsights(embedding: number[], options?: {
    type?: string;
    confidence?: number;
    limit?: number;
  }): Promise<CodeInsight[]> {
    const filter: Record<string, any> = {};
    
    if (options?.type) {
      filter.type = { $eq: options.type };
    }
    if (options?.confidence) {
      filter.confidence = { $gte: options.confidence };
    }

    const response = await this.index.namespace(this.NAMESPACE).query({
      topK: options?.limit || 10,
      vector: embedding,
      includeValues: true,
      includeMetadata: true,
      filter
    });

    return response.matches.map(match => ({
      id: match.id,
      type: match.metadata.type,
      path: match.metadata.path,
      description: match.metadata.description,
      confidence: match.metadata.confidence
    }));
  }

  async storeLearningMetrics(metrics: LearningMetric[], embedding: number[]) {
    await this.index.namespace('learning-metrics').upsert([{
      id: `metrics-${Date.now()}`,
      values: embedding,
      metadata: {
        metrics: metrics,
        timestamp: Date.now()
      }
    }]);
  }

  async findSimilarLearningPatterns(embedding: number[], limit: number = 5) {
    const response = await this.index.namespace('learning-metrics').query({
      topK: limit,
      vector: embedding,
      includeValues: true,
      includeMetadata: true
    });

    return response.matches.map(match => match.metadata.metrics);
  }

  async deleteOldInsights(cutoffDate: number) {
    const response = await this.index.namespace(this.NAMESPACE).query({
      topK: 10000,
      vector: new Array(1536).fill(0), // Adjust dimension based on your embeddings
      filter: {
        timestamp: { $lt: cutoffDate }
      }
    });

    if (response.matches.length > 0) {
      await this.index.namespace(this.NAMESPACE).deleteMany({
        ids: response.matches.map(match => match.id)
      });
    }
  }
}