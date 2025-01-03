import { Pinecone, QueryOptions } from '@pinecone-database/pinecone'
import {
  VectorMetadata,
  SearchResult,
  VectorStoreConfig,
  RetryConfig,
  MetricsCallback,
  PineconeIndex,
  EnhancedSearchResult,
} from './types'
import { RelevanceScorer } from '../relevance/RelevanceScorer'
import {
  VectorStoreConnectionError,
  VectorStoreOperationError,
  VectorStoreValidationError,
} from './errors'

const DEFAULT_CONFIG: VectorStoreConfig = {
  namespace: 'default',
  dimension: 1536,
  retryAttempts: 3,
  retryDelay: 1000,
  connectionTimeout: 10000,
  operationTimeout: 30000,
}

export class VectorStore {
  private static instance: VectorStore
  private client: Pinecone | null = null
  private index: PineconeIndex | null = null
  private readonly config: Required<VectorStoreConfig>
  private metricsCallback?: MetricsCallback
  private relevanceScorer: RelevanceScorer

  private constructor(config: VectorStoreConfig = {}, metricsCallback?: MetricsCallback) {
    this.config = { ...DEFAULT_CONFIG, ...config } as Required<VectorStoreConfig>
    this.metricsCallback = metricsCallback
    this.relevanceScorer = new RelevanceScorer()
  }

  public static async getInstance(
    config?: VectorStoreConfig,
    metricsCallback?: MetricsCallback
  ): Promise<VectorStore> {
    if (!VectorStore.instance) {
      VectorStore.instance = new VectorStore(config, metricsCallback)
      await VectorStore.instance.initialize()
    }
    return VectorStore.instance
  }

  private async initialize(): Promise<void> {
    if (!this.client) {
      try {
        const apiKey = import.meta.env.VITE_PINECONE_API_KEY
        const indexName = import.meta.env.VITE_PINECONE_INDEX_NAME

        if (!apiKey || !indexName) {
          throw new VectorStoreConnectionError('Missing required environment variables')
        }

        // Initialize Pinecone client
        this.client = new Pinecone({
          apiKey,
        })

        this.index = this.client.Index(indexName)

        // Verify connection by attempting to describe the index
        await this.index.describeIndexStats()
      } catch (error) {
        this.client = null
        this.index = null
        throw new VectorStoreConnectionError('Failed to initialize Pinecone client', error as Error)
      }
    }
  }

  public async getIndexStats() {
    if (!this.index) {
      throw new VectorStoreConnectionError('Vector store not initialized')
    }
    return this.index.describeIndexStats()
  }

  private async withRetry<T>(operation: string, fn: () => Promise<T>): Promise<T> {
    const retryConfig: RetryConfig = {
      attempts: this.config.retryAttempts,
      delay: this.config.retryDelay,
      shouldRetry: (error: Error) => {
        // Retry on connection errors or rate limits
        return error instanceof VectorStoreConnectionError || error.message.includes('rate limit')
      },
    }

    const startTime = Date.now()
    let lastError: Error | undefined
    let retryCount = 0

    for (let attempt = 1; attempt <= retryConfig.attempts; attempt++) {
      try {
        const result = await fn()

        this.recordMetrics(operation, {
          operationLatency: Date.now() - startTime,
          retryCount,
          success: true,
        })

        return result
      } catch (error) {
        lastError = error as Error
        retryCount++

        if (attempt === retryConfig.attempts || !retryConfig.shouldRetry(lastError)) {
          break
        }

        await new Promise(resolve =>
          setTimeout(resolve, retryConfig.delay * Math.pow(2, attempt - 1))
        )
      }
    }

    this.recordMetrics(operation, {
      operationLatency: Date.now() - startTime,
      retryCount,
      success: false,
      error: lastError,
    })

    throw new VectorStoreOperationError(operation, 'Operation failed after retries', lastError)
  }

  private recordMetrics(
    operation: string,
    metrics: {
      operationLatency: number
      retryCount: number
      success: boolean
      error?: Error
    }
  ): void {
    this.metricsCallback?.(operation, metrics)
  }

  public async storeEmbedding(vector: number[], metadata: VectorMetadata): Promise<void> {
    this.validateVector(vector)
    this.validateMetadata(metadata)

    if (!this.index) {
      throw new VectorStoreConnectionError('Vector store not initialized')
    }

    await this.withRetry('storeEmbedding', async () => {
      await this.index!.upsert([
        {
          id: metadata.id,
          values: vector,
          metadata,
        },
      ])
    })
  }

  public async semanticSearch(
    queryVector: number[],
    k: number = 5,
    filter?: object
  ): Promise<SearchResult[]> {
    return this.enhancedSemanticSearch(queryVector, { timestamp: Date.now() }, k, filter)
  }

  public async enhancedSemanticSearch(
    queryVector: number[],
    queryContext: {
      timestamp: number
      tags?: string[]
      source?: string
    },
    k: number = 5,
    filter?: object
  ): Promise<EnhancedSearchResult[]> {
    this.validateVector(queryVector)

    if (!this.index) {
      throw new VectorStoreConnectionError('Vector store not initialized')
    }

    return this.withRetry('enhancedSemanticSearch', async () => {
      // Get more results than needed to allow for relevance-based reranking
      const expandedK = Math.min(k * 2, 100)

      const queryOptions: QueryOptions = {
        vector: queryVector,
        topK: expandedK,
        includeMetadata: true,
        includeValues: true,
      }

      if (filter) {
        queryOptions.filter = filter
      }

      const queryResponse = await this.index!.query(queryOptions)

      // Convert matches to SearchResults and calculate relevance
      const results = queryResponse.matches.map(
        (match: { id: string; score?: number; metadata: unknown; values?: number[] }) => {
          const searchResult: SearchResult = {
            id: match.id,
            score: match.score || 0,
            metadata: match.metadata as VectorMetadata,
            vector: match.values || [],
          }

          // Calculate comprehensive relevance metrics
          const relevanceMetrics = this.relevanceScorer.calculateRelevance(
            searchResult,
            queryContext
          )

          return {
            ...searchResult,
            relevanceMetrics,
          }
        }
      )

      // Sort by final relevance score and take top k
      return results
        .sort(
          (a: EnhancedSearchResult, b: EnhancedSearchResult) =>
            b.relevanceMetrics.finalScore - a.relevanceMetrics.finalScore
        )
        .slice(0, k)
    })
  }

  public async deleteEmbedding(id: string): Promise<void> {
    if (!this.index) {
      throw new VectorStoreConnectionError('Vector store not initialized')
    }

    await this.withRetry('deleteEmbedding', async () => {
      await this.index!.deleteOne(id)
    })
  }

  public async deleteNamespace(): Promise<void> {
    if (!this.index) {
      throw new VectorStoreConnectionError('Vector store not initialized')
    }

    await this.withRetry('deleteNamespace', async () => {
      await this.index!.deleteAll()
    })
  }

  private validateVector(vector: number[]): void {
    if (!Array.isArray(vector)) {
      throw new VectorStoreValidationError('Vector must be an array')
    }
    if (vector.length !== this.config.dimension) {
      throw new VectorStoreValidationError(`Vector must have dimension ${this.config.dimension}`)
    }
    if (!vector.every(v => typeof v === 'number' && !isNaN(v))) {
      throw new VectorStoreValidationError('Vector must contain only valid numbers')
    }
  }

  private validateMetadata(metadata: VectorMetadata): void {
    const requiredFields = ['id', 'type', 'timestamp', 'source']
    for (const field of requiredFields) {
      if (!metadata[field]) {
        throw new VectorStoreValidationError(`Metadata must have a valid ${field}`)
      }
    }

    if (typeof metadata.timestamp !== 'number') {
      throw new VectorStoreValidationError('Metadata timestamp must be a number')
    }
  }
}
