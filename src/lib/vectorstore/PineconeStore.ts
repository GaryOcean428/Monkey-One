import { Pinecone } from '@pinecone-database/pinecone';
import type { CodeInsight, LearningMetric } from '../../types';

export class PineconeStore {
  private pc: Pinecone;
  private index: any;
  private readonly NAMESPACE = 'monkey-one';
  private readonly INDEX_NAME: string;
  private readonly DIMENSIONS: number;

  constructor() {
    if (!import.meta.env.VITE_PINECONE_API_KEY) {
      throw new Error('Missing Pinecone API key');
    }
    
    this.INDEX_NAME = import.meta.env.VITE_PINECONE_INDEX_NAME || 'agent-one';
    this.DIMENSIONS = parseInt(import.meta.env.VITE_PINECONE_DIMENSIONS || '3072');
    
    this.pc = new Pinecone({
      apiKey: import.meta.env.VITE_PINECONE_API_KEY,
      environment: import.meta.env.VITE_PINECONE_ENVIRONMENT
    });
    
    this.initializeIndex();
  }

  private async initializeIndex() {
    try {
      // Check if index exists
      const indexes = await this.pc.listIndexes();
      const indexExists = indexes.some(index => index.name === this.INDEX_NAME);

      if (!indexExists) {
        console.log(`Creating new Pinecone index: ${this.INDEX_NAME}`);
        await this.pc.createIndex({
          name: this.INDEX_NAME,
          dimension: this.DIMENSIONS,
          metric: import.meta.env.VITE_PINECONE_METRIC || 'cosine'
        });
        
        // Wait for index to be ready
        let status = 'initializing';
        while (status !== 'ready') {
          const description = await this.pc.describeIndex(this.INDEX_NAME);
          status = description.status.state;
          if (status === 'failed') {
            throw new Error('Failed to initialize Pinecone index');
          }
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      this.index = this.pc.index(this.INDEX_NAME);
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
    
    if (embedding.length !== this.DIMENSIONS) {
      throw new Error(`Embedding dimension mismatch. Expected ${this.DIMENSIONS}, got ${embedding.length}`);
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

    if (embedding.length !== this.DIMENSIONS) {
      throw new Error(`Embedding dimension mismatch. Expected ${this.DIMENSIONS}, got ${embedding.length}`);
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
    
    if (embedding.length !== this.DIMENSIONS) {
      throw new Error(`Embedding dimension mismatch. Expected ${this.DIMENSIONS}, got ${embedding.length}`);
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

    if (embedding.length !== this.DIMENSIONS) {
      throw new Error(`Embedding dimension mismatch. Expected ${this.DIMENSIONS}, got ${embedding.length}`);
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
        vector: new Array(this.DIMENSIONS).fill(0),
        filter: {
          timestamp: { $lt: cutoffDate }
        }
      });

      if (response.matches && response.matches.length > 0) {
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