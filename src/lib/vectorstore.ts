import type {
  DeleteOptions,
  IndexOptions,
  Insight,
  LearningMetric,
  SearchOptions,
  SearchResult,
  UpsertOptions,
  VectorIndex,
  VectorStore,
  VectorStoreConfig,
  VectorStoreStats,
} from '../types/vectorstore'
import { logger } from '../utils/logger'

type StoredVector = {
  id: string
  values: number[]
  metadata: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
}

class InMemoryVectorStore implements VectorStore {
  private readonly config: VectorStoreConfig
  private readonly dimension: number
  private readonly indexes: Map<string, Map<string, StoredVector>> = new Map()

  constructor(config: VectorStoreConfig) {
    this.config = config
    this.dimension = config.dimensions ?? 128

    const defaultIndex = config.defaultIndex ?? 'default'
    this.ensureIndexExists(defaultIndex)
  }

  private ensureIndexExists(name: string): void {
    if (!this.indexes.has(name)) {
      this.indexes.set(name, new Map())
    }
  }

  private getIndex(name?: string): Map<string, StoredVector> {
    const target = name ?? this.config.defaultIndex ?? 'default'
    this.ensureIndexExists(target)
    return this.indexes.get(target) as Map<string, StoredVector>
  }

  async listIndexes(): Promise<VectorIndex[]> {
    return Array.from(this.indexes.entries()).map(([name, records]) =>
      this.describeIndexFromRecords(name, records)
    )
  }

  async createIndex(name: string, dimension: number, options?: IndexOptions): Promise<void> {
    this.ensureIndexExists(name)
    if (dimension !== this.dimension) {
      logger.warn('In-memory vector store uses a fixed dimension', {
        requested: dimension,
        configured: this.dimension,
      })
    }

    if (options?.description) {
      logger.debug('Index description stored for reference', {
        name,
        description: options.description,
      })
    }
  }

  async deleteIndex(name: string): Promise<void> {
    this.indexes.delete(name)
  }

  async describeIndex(name: string): Promise<VectorIndex> {
    const records = this.getIndex(name)
    return this.describeIndexFromRecords(name, records)
  }

  async updateIndex(name: string, _options: Partial<IndexOptions>): Promise<void> {
    this.ensureIndexExists(name)
    // No-op for in-memory implementation; options retained for API compatibility
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const values = new Array(this.dimension).fill(0)
    for (let i = 0; i < text.length; i++) {
      const index = i % this.dimension
      values[index] += text.charCodeAt(i) / 255
    }
    return values
  }

  async upsert(
    vectors: Array<{ id: string; values: number[]; metadata?: Record<string, unknown> }>,
    options?: UpsertOptions
  ): Promise<void> {
    const index = this.getIndex(options?.namespace)

    for (const vector of vectors) {
      if (vector.values.length !== this.dimension) {
        throw new Error(`Vector must have dimension ${this.dimension}`)
      }

      const existing = index.get(vector.id)
      const now = new Date()
      index.set(vector.id, {
        id: vector.id,
        values: vector.values,
        metadata: { ...existing?.metadata, ...vector.metadata },
        createdAt: existing?.createdAt ?? now,
        updatedAt: now,
      })
    }

    if (options?.onProgress) {
      options.onProgress(100)
    }
  }

  async search(vector: number[], options?: SearchOptions): Promise<SearchResult[]> {
    if (vector.length !== this.dimension) {
      throw new Error(`Vector must have dimension ${this.dimension}`)
    }

    const index = this.getIndex(options?.index ?? options?.namespace)
    const matches = Array.from(index.values())
      .map(record => ({
        record,
        score: this.cosineSimilarity(vector, record.values),
      }))
      .filter(entry => {
        const minScore = options?.minScore ?? -1
        return entry.score >= minScore
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, options?.limit ?? 10)

    return matches.map(({ record, score }) => ({
      id: record.id,
      score,
      vector: options?.includeVectors ? record.values : [],
      metadata: options?.includeMetadata ? record.metadata : {},
      content: String(record.metadata.content ?? ''),
      source: record.metadata.source as string | undefined,
      timestamp: record.metadata.timestamp as string | undefined,
    }))
  }

  async delete(ids: string[], options?: DeleteOptions): Promise<void> {
    const index = this.getIndex(options?.namespace)

    if (options?.deleteAll) {
      index.clear()
      return
    }

    for (const id of ids) {
      index.delete(id)
    }
  }

  async findSimilarInsights(
    embedding: number[],
    options?: { type?: string; confidence?: number; limit?: number; useCache?: boolean }
  ): Promise<SearchResult[]> {
    const results = await this.search(embedding, {
      limit: options?.limit,
      minScore: options?.confidence,
      includeMetadata: true,
    })

    if (!options?.type) {
      return results
    }

    return results.filter(result => result.metadata.type === options.type)
  }

  async findSimilarLearningPatterns(embedding: number[], limit?: number): Promise<SearchResult[]> {
    const results = await this.search(embedding, {
      limit,
      includeMetadata: true,
    })
    return results.filter(result => result.metadata.type === 'learning_pattern')
  }

  async storeInsight(insight: Insight, embedding: number[]): Promise<void> {
    await this.upsert([
      {
        id: insight.id,
        values: embedding,
        metadata: {
          ...insight.metadata,
          type: insight.type ?? 'insight',
          content: insight.content,
          timestamp: new Date().toISOString(),
        },
      },
    ])
  }

  async storeLearningMetrics(metrics: LearningMetric[], embedding: number[]): Promise<void> {
    const records = metrics.map(metric => ({
      id: metric.id,
      values: embedding,
      metadata: {
        ...metric.metadata,
        type: 'learning_metric',
        metricType: metric.metricType,
        value: metric.value,
        timestamp: new Date().toISOString(),
      },
    }))

    await this.upsert(records)
  }

  async getStats(): Promise<VectorStoreStats> {
    const indexes = await this.listIndexes()

    const totalVectors = indexes.reduce((count, index) => count + index.stats.vectorCount, 0)
    const totalStorageBytes = indexes.reduce((size, index) => {
      const numeric = parseFloat(index.stats.indexSize)
      return size + (Number.isNaN(numeric) ? 0 : numeric)
    }, 0)

    return {
      totalVectors,
      totalIndexes: indexes.length,
      totalStorage: `${totalStorageBytes.toFixed(2)} KB`,
      avgQueryTime: 0,
      uptime: '100%',
    }
  }

  private describeIndexFromRecords(name: string, records: Map<string, StoredVector>): VectorIndex {
    const vectorCount = records.size
    const bytesApprox = vectorCount * this.dimension * 8

    return {
      id: name,
      name,
      description: 'In-memory vector index',
      dimension: this.dimension,
      metric: this.config.metric ?? 'cosine',
      pods: 1,
      replicas: 1,
      status: 'ready',
      created: new Date(0).toISOString(),
      updated: new Date().toISOString(),
      stats: {
        vectorCount,
        dimension: this.dimension,
        indexSize: (bytesApprox / 1024).toFixed(2),
      },
      usage: vectorCount > 0 ? Math.min((vectorCount / 1000) * 100, 100) : 0,
    }
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    let dotProduct = 0
    let magnitudeA = 0
    let magnitudeB = 0

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i]
      magnitudeA += a[i] * a[i]
      magnitudeB += b[i] * b[i]
    }

    if (magnitudeA === 0 || magnitudeB === 0) {
      return 0
    }

    return dotProduct / (Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB))
  }
}

export const vectorStore = new InMemoryVectorStore({
  apiKey: '',
  defaultIndex: 'default',
  dimensions: 128,
  metric: 'cosine',
})
