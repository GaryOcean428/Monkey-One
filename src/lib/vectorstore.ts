import { PineconeClient } from '@pinecone-database/pinecone';
import OpenAI from 'openai';
import type {
  VectorStore,
  VectorIndex,
  SearchResult,
  VectorStoreConfig,
  VectorStoreStats,
  IndexOptions,
  SearchOptions,
  UpsertOptions,
  DeleteOptions,
} from '../types/vectorstore';

class VectorStoreImpl implements VectorStore {
  private pinecone: PineconeClient;
  private openai: OpenAI;
  private config: VectorStoreConfig;
  private ready: boolean = false;

  constructor(config: VectorStoreConfig) {
    this.config = config;
    this.pinecone = new PineconeClient();
    this.openai = new OpenAI({
      apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    });
  }

  private async initialize() {
    if (!this.ready) {
      await this.pinecone.init({
        environment: this.config.environment,
        apiKey: this.config.apiKey,
      });
      this.ready = true;
    }
  }

  async listIndexes(): Promise<VectorIndex[]> {
    await this.initialize();
    const { indexes } = await this.pinecone.listIndexes();
    
    const indexDetails = await Promise.all(
      indexes.map(async (index) => {
        const details = await this.describeIndex(index.name);
        return details;
      })
    );

    return indexDetails;
  }

  async createIndex(name: string, dimension: number, options?: IndexOptions): Promise<void> {
    await this.initialize();
    await this.pinecone.createIndex({
      name,
      dimension,
      metric: options?.metric || 'cosine',
      pods: options?.pods || 1,
      replicas: options?.replicas || 1,
      metadata: options?.metadata,
    });
  }

  async deleteIndex(name: string): Promise<void> {
    await this.initialize();
    await this.pinecone.deleteIndex(name);
  }

  async describeIndex(name: string): Promise<VectorIndex> {
    await this.initialize();
    const index = await this.pinecone.describeIndex(name);
    const stats = await this.pinecone.Index(name).describeIndexStats();
    
    return {
      id: index.name,
      name: index.name,
      description: index.metadata?.description,
      dimension: index.dimension,
      metric: index.metric,
      pods: index.pods,
      replicas: index.replicas,
      status: index.status.state,
      created: index.status.ready,
      updated: index.status.ready,
      stats: {
        vectorCount: stats.totalVectorCount,
        dimension: index.dimension,
        indexSize: this.formatBytes(stats.totalVectorCount * index.dimension * 4),
      },
      usage: (stats.totalVectorCount / (index.pods * 1000000)) * 100, // Assuming 1M vectors per pod
    };
  }

  async updateIndex(name: string, options: Partial<IndexOptions>): Promise<void> {
    await this.initialize();
    await this.pinecone.configureIndex(name, {
      replicas: options.replicas,
      podType: options.pods ? `p${options.pods}` : undefined,
    });
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const response = await this.openai.Embedding({
      model: 'text-embedding-ada-002',
      input: text,
    });
    return response.data.data[0].embedding;
  }

  async upsert(
    vectors: Array<{ id: string; values: number[]; metadata?: Record<string, any> }>,
    options?: UpsertOptions
  ): Promise<void> {
    await this.initialize();
    const index = this.pinecone.Index(options?.namespace || this.config.defaultIndex || '');

    if (options?.batch) {
      const batchSize = options.batchSize || 100;
      for (let i = 0; i < vectors.length; i += batchSize) {
        const batch = vectors.slice(i, i + batchSize);
        await index.upsert(batch);
        options.onProgress?.((i + batchSize) / vectors.length * 100);
      }
    } else {
      await index.upsert(vectors);
    }
  }

  async search(vector: number[], options?: SearchOptions): Promise<SearchResult[]> {
    await this.initialize();
    const index = this.pinecone.Index(options?.index || this.config.defaultIndex || '');
    
    const results = await index.query({
      vector,
      namespace: options?.namespace,
      filter: options?.filter,
      includeMetadata: options?.includeMetadata,
      includeValues: options?.includeVectors,
      topK: options?.limit || 10,
    });

    return results.matches.map(match => ({
      id: match.id,
      score: match.score,
      vector: match.values || [],
      metadata: match.metadata || {},
      content: match.metadata?.content || '',
      source: match.metadata?.source,
      timestamp: match.metadata?.timestamp,
    }));
  }

  async delete(ids: string[], options?: DeleteOptions): Promise<void> {
    await this.initialize();
    const index = this.pinecone.Index(options?.namespace || this.config.defaultIndex || '');
    
    if (options?.deleteAll) {
      await index.delete1({
        deleteAll: true,
        namespace: options.namespace,
        filter: options.filter,
      });
    } else {
      await index.delete1({
        ids,
        namespace: options.namespace,
      });
    }
  }

  async findSimilarInsights(
    embedding: number[],
    options?: { type?: string; confidence?: number; limit?: number; useCache?: boolean }
  ): Promise<SearchResult[]> {
    return this.search(embedding, {
      filter: options?.type ? { type: options.type } : undefined,
      limit: options?.limit,
      minScore: options?.confidence,
    });
  }

  async findSimilarLearningPatterns(embedding: number[], limit?: number): Promise<SearchResult[]> {
    return this.search(embedding, {
      filter: { type: 'learning_pattern' },
      limit,
    });
  }

  async storeInsight(insight: any, embedding: number[]): Promise<void> {
    await this.upsert([{
      id: insight.id,
      values: embedding,
      metadata: {
        ...insight,
        type: 'insight',
        timestamp: new Date().toISOString(),
      },
    }]);
  }

  async storeLearningMetrics(metrics: any[], embedding: number[]): Promise<void> {
    await this.upsert([{
      id: `metrics-${Date.now()}`,
      values: embedding,
      metadata: {
        metrics,
        type: 'learning_metrics',
        timestamp: new Date().toISOString(),
      },
    }]);
  }

  async getStats(): Promise<VectorStoreStats> {
    await this.initialize();
    const indexes = await this.listIndexes();
    
    const totalVectors = indexes.reduce((sum, index) => sum + index.stats.vectorCount, 0);
    const totalStorage = this.formatBytes(
      indexes.reduce((sum, index) => sum + parseInt(index.stats.indexSize), 0)
    );

    return {
      totalVectors,
      totalIndexes: indexes.length,
      totalStorage,
      avgQueryTime: 0, // TODO: Implement query time tracking
      uptime: '100%', // TODO: Implement uptime tracking
    };
  }

  private formatBytes(bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(2))} ${sizes[i]}`;
  }
}

// Create and export a singleton instance
export const vectorStore = new VectorStoreImpl({
  apiKey: import.meta.env.VITE_PINECONE_API_KEY || '',
  environment: import.meta.env.VITE_PINECONE_ENVIRONMENT || '',
  projectId: import.meta.env.VITE_PINECONE_INDEX_NAME || '',
});
