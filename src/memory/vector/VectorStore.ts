import {
  VectorMetadata,
  SearchResult,
  VectorStoreConfig,
  MetricsCallback,
  EnhancedSearchResult,
} from './types'
import { RelevanceScorer } from '../relevance/RelevanceScorer'
import { VectorStoreOperationError, VectorStoreValidationError } from './errors'
import axios, { AxiosResponse } from 'axios'

const DEFAULT_CONFIG: Required<VectorStoreConfig> = {
  namespace: 'default',
  dimension: 1536,
  retryAttempts: 3,
  retryDelay: 1000,
  connectionTimeout: 10000,
  operationTimeout: 30000,
}

interface ApiRequest {
  operation: string
  data: Record<string, unknown>
}

interface ApiResponse<T> {
  success: boolean
  data: T
  error?: string
}

interface SearchApiResponse {
  matches: Array<{
    id: string
    score?: number
    metadata: unknown
    values?: number[]
  }>
}

export class VectorStore {
  private static instance: VectorStore
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
    }
    return VectorStore.instance
  }

  private async callVectorApi<T>(operation: string, data: Record<string, unknown>): Promise<T> {
    const startTime = Date.now()
    let retryCount = 0
    let lastError: Error | null = null

    const request: ApiRequest = {
      operation,
      data,
    }

    while (retryCount < this.config.retryAttempts) {
      try {
        const response = await axios.post<ApiResponse<T>, AxiosResponse<ApiResponse<T>>>(
          '/api/vector-store',
          request,
          {
            timeout: this.config.operationTimeout,
          }
        )

        if (!response.data.success) {
          throw new VectorStoreOperationError(
            operation,
            response.data.error || 'Unknown operation error'
          )
        }

        this.recordMetrics(operation, {
          operationLatency: Date.now() - startTime,
          retryCount,
          success: true,
        })

        return response.data.data
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error')
        retryCount++

        if (retryCount < this.config.retryAttempts) {
          await new Promise(resolve => setTimeout(resolve, this.config.retryDelay * retryCount))
        }
      }
    }

    this.recordMetrics(operation, {
      operationLatency: Date.now() - startTime,
      retryCount,
      success: false,
      error: lastError || new Error('Max retries exceeded'),
    })

    throw lastError || new Error('Vector store operation failed after max retries')
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
    if (this.metricsCallback) {
      try {
        this.metricsCallback(operation, metrics)
      } catch (error) {
        console.error('Error recording metrics:', error)
      }
    }
  }

  public async storeEmbedding(vector: number[], metadata: VectorMetadata): Promise<void> {
    this.validateVector(vector)
    this.validateMetadata(metadata)

    await this.callVectorApi('store', {
      vectors: [
        {
          id: metadata.id,
          values: vector,
          metadata,
        },
      ],
    })
  }

  public async semanticSearch(
    queryVector: number[],
    k: number = 5,
    filter?: object,
    queryContext: { timestamp: number; tags?: string[]; source?: string } = {
      timestamp: Date.now(),
    }
  ): Promise<SearchResult[]> {
    return this.enhancedSemanticSearch(queryVector, queryContext, k, filter)
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

    const expandedK = Math.min(k * 2, 100)

    const searchResponse = await this.callVectorApi<SearchApiResponse>('search', {
      vector: queryVector,
      k: expandedK,
      filter,
    })

    const results = searchResponse.matches.map(
      (match: { id: string; score?: number; metadata: unknown; values?: number[] }) => {
        const searchResult: SearchResult = {
          id: match.id,
          score: match.score || 0,
          metadata: match.metadata as VectorMetadata,
          vector: match.values || [],
        }

        const relevanceMetrics = this.relevanceScorer.calculateRelevance(searchResult, queryContext)

        return {
          ...searchResult,
          relevanceMetrics,
        }
      }
    )

    return results
      .sort(
        (a: EnhancedSearchResult, b: EnhancedSearchResult) =>
          b.relevanceMetrics.finalScore - a.relevanceMetrics.finalScore
      )
      .slice(0, k)
  }

  public async deleteEmbedding(id: string): Promise<void> {
    await this.callVectorApi('delete', { ids: [id] })
  }

  public async deleteNamespace(): Promise<void> {
    await this.callVectorApi('delete', { ids: [] }) // Empty array means delete all
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
