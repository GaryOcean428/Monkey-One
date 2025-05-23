export interface VectorIndex {
  id: string
  name: string
  description?: string
  dimension: number
  metric: 'cosine' | 'euclidean' | 'dotproduct'
  pods: number
  replicas: number
  status: 'ready' | 'scaling' | 'pending' | 'error'
  created: string
  updated: string
  stats: {
    vectorCount: number
    dimension: number
    indexSize: string
  }
  usage: number
}

export interface SearchResult {
  id: string
  score: number
  vector: number[]
  metadata: Record<string, unknown>
  content: string
  source?: string
  timestamp?: string
}

export interface VectorStoreConfig {
  apiKey: string
  environment?: string
  projectId?: string
  defaultIndex?: string
  namespace?: string
  dimensions?: number
  metric?: 'cosine' | 'euclidean' | 'dotproduct'
}

export interface VectorStoreStats {
  totalVectors: number
  totalIndexes: number
  totalStorage: string
  avgQueryTime: number
  uptime: string
}

export interface VectorStoreError extends Error {
  code: string
  details?: Record<string, unknown>
  retryable: boolean
}

export interface IndexOptions {
  description?: string
  metric?: 'cosine' | 'euclidean' | 'dotproduct'
  pods?: number
  replicas?: number
  shards?: number
  metadata?: Record<string, unknown>
}

export interface SearchOptions {
  index?: string
  namespace?: string
  filter?: Record<string, unknown>
  includeMetadata?: boolean
  includeVectors?: boolean
  limit?: number
  offset?: number
  minScore?: number
}

export interface UpsertOptions {
  namespace?: string
  batch?: boolean
  batchSize?: number
  onProgress?: (progress: number) => void
}

export interface DeleteOptions {
  namespace?: string
  filter?: Record<string, unknown>
  deleteAll?: boolean
}

export interface Insight {
  id: string
  type: string
  content: string
  metadata: Record<string, unknown>
  timestamp: string
}

export interface LearningMetric {
  id: string
  metricType: string
  value: number
  metadata: Record<string, unknown>
  timestamp: string
}

export interface VectorStore {
  // Index Management
  listIndexes(): Promise<VectorIndex[]>
  createIndex(name: string, dimension: number, options?: IndexOptions): Promise<void>
  deleteIndex(name: string): Promise<void>
  describeIndex(name: string): Promise<VectorIndex>
  updateIndex(name: string, options: Partial<IndexOptions>): Promise<void>

  // Vector Operations
  generateEmbedding(text: string): Promise<number[]>
  upsert(
    vectors: Array<{ id: string; values: number[]; metadata?: Record<string, unknown> }>,
    options?: UpsertOptions
  ): Promise<void>
  search(vector: number[], options?: SearchOptions): Promise<SearchResult[]>
  delete(ids: string[], options?: DeleteOptions): Promise<void>

  // Utility Functions
  findSimilarInsights(
    embedding: number[],
    options?: { type?: string; confidence?: number; limit?: number; useCache?: boolean }
  ): Promise<SearchResult[]>
  findSimilarLearningPatterns(embedding: number[], limit?: number): Promise<SearchResult[]>
  storeInsight(insight: Insight, embedding: number[]): Promise<void>
  storeLearningMetrics(metrics: LearningMetric[], embedding: number[]): Promise<void>

  // Statistics
  getStats(): Promise<VectorStoreStats>
}
