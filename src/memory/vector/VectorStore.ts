import { Pinecone } from '@pinecone-database/pinecone';

export interface VectorMetadata {
  id: string;
  type: string;
  timestamp: number;
  source: string;
  [key: string]: any;
}

export interface SearchResult {
  id: string;
  score: number;
  metadata: VectorMetadata;
  vector: number[];
}

export class VectorStore {
  private static instance: VectorStore;
  private client: Pinecone;
  private index: any;
  private namespace: string;
  private dimension: number;

  private constructor(
    namespace: string = 'default',
    dimension: number = 1536
  ) {
    this.namespace = namespace;
    this.dimension = dimension;
  }

  public static async getInstance(
    namespace?: string,
    dimension?: number
  ): Promise<VectorStore> {
    if (!VectorStore.instance) {
      VectorStore.instance = new VectorStore(namespace, dimension);
      await VectorStore.instance.initialize();
    }
    return VectorStore.instance;
  }

  private async initialize(): Promise<void> {
    if (!this.client) {
      try {
        // Initialize with only apiKey
        this.client = new Pinecone({
          apiKey: import.meta.env.VITE_PINECONE_API_KEY
        });
        
        // Configure environment after initialization
        this.client.environment = import.meta.env.VITE_PINECONE_ENVIRONMENT;
      } catch (error) {
        console.error('Failed to initialize Pinecone client:', error);
        throw error;
      }
    }
  }

  public async storeEmbedding(
    vector: number[],
    metadata: VectorMetadata
  ): Promise<void> {
    this.validateVector(vector);
    this.validateMetadata(metadata);

    const index = this.client.Index(this.namespace);
    await index.upsert({
      upsertRequest: {
        vectors: [{
          id: metadata.id,
          values: vector,
          metadata
        }],
        namespace: this.namespace
      }
    });
  }

  public async semanticSearch(
    queryVector: number[],
    k: number = 5,
    filter?: object
  ): Promise<SearchResult[]> {
    this.validateVector(queryVector);

    const index = this.client.Index(this.namespace);
    const queryResponse = await index.query({
      queryRequest: {
        vector: queryVector,
        topK: k,
        includeMetadata: true,
        includeValues: true,
        namespace: this.namespace,
        filter
      }
    });

    return queryResponse.matches.map(match => ({
      id: match.id,
      score: match.score,
      metadata: match.metadata as VectorMetadata,
      vector: match.values
    }));
  }

  public async deleteEmbedding(id: string): Promise<void> {
    const index = this.client.Index(this.namespace);
    await index.delete1({
      ids: [id],
      namespace: this.namespace
    });
  }

  public async deleteNamespace(): Promise<void> {
    const index = this.client.Index(this.namespace);
    await index.delete1({
      deleteAll: true,
      namespace: this.namespace
    });
  }

  private validateVector(vector: number[]): void {
    if (!Array.isArray(vector)) {
      throw new Error('Vector must be an array');
    }
    if (vector.length !== this.dimension) {
      throw new Error(`Vector must have dimension ${this.dimension}`);
    }
    if (!vector.every(v => typeof v === 'number')) {
      throw new Error('Vector must contain only numbers');
    }
  }

  private validateMetadata(metadata: VectorMetadata): void {
    if (!metadata.id) {
      throw new Error('Metadata must have an id');
    }
    if (!metadata.type) {
      throw new Error('Metadata must have a type');
    }
    if (!metadata.timestamp) {
      throw new Error('Metadata must have a timestamp');
    }
    if (!metadata.source) {
      throw new Error('Metadata must have a source');
    }
  }
}
