import { Pinecone } from '@pinecone-database/pinecone';
import type { CodeInsight, LearningMetric } from '@/types';

export class PineconeStore {
  private pc: Pinecone;
  private index: any;
  private readonly NAMESPACE = 'monkey-one';
  private readonly INDEX_NAME = 'quickstart';

  constructor() {
    if (!import.meta.env.VITE_PINECONE_API_KEY) {
      throw new Error('Missing Pinecone API key');
    }
    
    this.pc = new Pinecone({
      apiKey: import.meta.env.VITE_PINECONE_API_KEY,
      environment: import.meta.env.VITE_PINECONE_ENVIRONMENT || 'us-west1-gcp'
    });
    
    this.initializeIndex();
  }

  private async initializeIndex() {
    try {
      this.index = this.pc.index(this.INDEX_NAME);
      // Verify the index exists and is ready
      const indexDescription = await this.pc.describeIndex(this.INDEX_NAME);
      console.log('Pinecone index status:', indexDescription.status);
    } catch (error) {
      console.error('Failed to initialize Pinecone index:', error);
      throw new Error('Failed to initialize vector store');
    }
  }

  async storeCodeInsight(insight: CodeInsight, embedding: number[]) {
    if (!this.index) {
      await this.initializeIndex();
    }
    
    try {
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
    } catch (error) {
      console.error('Failed to store code insight:', error);
      throw error;
    }
  }

  async findSimilarInsights(embedding: number[], options?: {
    type?: string;
    confidence?: number;
    limit?: number;
  }): Promise<CodeInsight[]> {
    if (!this.index) {
      await this.initializeIndex();
    }

    const filter: Record<string, any> = {};
    
    if (options?.type) {
      filter.type = { $eq: options.type };
    }
    if (options?.confidence) {
      filter.confidence = { $gte: options.confidence };
    }

    try {
      const response = await this.index.namespace(this.NAMESPACE).query({
        topK: options?.limit || 10,
        vector: embedding,
        includeValues: true,
        includeMetadata: true,
        filter
      });

      if (!response.matches) {
        return [];
      }

      return response.matches.map(match => ({
        id: match.id,
        type: match.metadata.type,
        path: match.metadata.path,
        description: match.metadata.description,
        confidence: match.metadata.confidence,
        timestamp: match.metadata.timestamp
      }));
    } catch (error) {
      console.error('Failed to query similar insights:', error);
      throw error;
    }
  }

  async storeLearningMetrics(metrics: LearningMetric[], embedding: number[]) {
    if (!this.index) {
      await this.initializeIndex();
    }
    
    try {
      await this.index.namespace('learning-metrics').upsert([{
        id: `metrics-${Date.now()}`,
        values: embedding,
        metadata: {
          metrics: metrics,
          timestamp: Date.now()
        }
      }]);
    } catch (error) {
      console.error('Failed to store learning metrics:', error);
      throw error;
    }
  }

  async findSimilarLearningPatterns(embedding: number[], limit: number = 5) {
    if (!this.index) {
      await this.initializeIndex();
    }

    try {
      const response = await this.index.namespace('learning-metrics').query({
        topK: limit,
        vector: embedding,
        includeValues: true,
        includeMetadata: true
      });

      if (!response.matches) {
        return [];
      }

      return response.matches.map(match => match.metadata.metrics);
    } catch (error) {
      console.error('Failed to query similar learning patterns:', error);
      throw error;
    }
  }

  async deleteOldInsights(cutoffDate: number) {
    if (!this.index) {
      await this.initializeIndex();
    }
    
    try {
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
    } catch (error) {
      console.error('Failed to delete old insights:', error);
      throw error;
    }
  }
}