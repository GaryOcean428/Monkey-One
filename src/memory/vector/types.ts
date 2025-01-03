import { RelevanceMetrics } from '../relevance/RelevanceScorer'

export interface VectorMetadata {
  id: string
  type: string
  timestamp: number
  source: string
  context?: Record<string, unknown>
  tags?: string[]
  [key: string]: string | number | unknown[] | undefined
}

export interface SearchResult {
  id: string
  score: number
  metadata: VectorMetadata
  vector: number[]
}

export interface EnhancedSearchResult extends SearchResult {
  relevanceMetrics: RelevanceMetrics
}

export interface VectorStoreConfig {
  namespace?: string
  dimension?: number
  retryAttempts?: number
  retryDelay?: number
  connectionTimeout?: number
  operationTimeout?: number
}

export interface RetryConfig {
  attempts: number
  delay: number
  shouldRetry: (error: Error) => boolean
}

export interface MetricsCallback {
  (
    operation: string,
    metrics: {
      operationLatency: number
      retryCount: number
      success: boolean
      error?: Error
    }
  ): void
}

export interface PineconeIndex {
  describeIndexStats: () => Promise<Record<string, unknown>>
  upsert: (
    vectors: Array<{ id: string; values: number[]; metadata?: VectorMetadata }>
  ) => Promise<void>
  query: (options: {
    vector: number[]
    topK: number
    includeMetadata?: boolean
    includeValues?: boolean
  }) => Promise<{
    matches: Array<{
      id: string
      score: number
      metadata?: VectorMetadata
      values?: number[]
    }>
  }>
  deleteOne: (id: string) => Promise<void>
  deleteAll: () => Promise<void>
}
