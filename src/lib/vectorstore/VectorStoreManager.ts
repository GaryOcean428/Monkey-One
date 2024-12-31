/* eslint-env browser */
import { initPinecone } from '../pinecone/config'
import type { CodeInsight, LearningMetric } from '../../types'
import { monitoring } from '../monitoring/MonitoringSystem'

declare const crypto: {
  getRandomValues(array: Uint8Array): Uint8Array
}

interface VectorMetadata {
  type: string
  timestamp: number
  [key: string]: unknown
}

interface QueryMatch<T> {
  id: string
  score?: number
  metadata?: T
}

interface QueryResponse<T> {
  matches?: QueryMatch<T>[]
}

export class VectorStoreManager {
  private static instance: VectorStoreManager
  private pineconeIndex: Awaited<ReturnType<typeof initPinecone>>['index'] | null = null

  private constructor() {}

  public static getInstance(): VectorStoreManager {
    if (!VectorStoreManager.instance) {
      VectorStoreManager.instance = new VectorStoreManager()
    }
    return VectorStoreManager.instance
  }

  async initialize() {
    const { index } = await initPinecone()
    this.pineconeIndex = index
  }

  private generateId(): string {
    return Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
  }

  async storeVector(vector: number[], metadata: VectorMetadata, namespace?: string) {
    if (!this.pineconeIndex) {
      throw new Error('VectorStore not initialized')
    }

    const operationId = this.generateId()
    monitoring.startOperation(operationId)

    try {
      await this.pineconeIndex.upsert({
        upsertRequest: {
          vectors: [
            {
              id: this.generateId(),
              values: vector,
              metadata,
            },
          ],
          namespace,
        },
      })

      monitoring.endOperation(operationId, 'vector_store_upsert')
    } catch (error) {
      monitoring.recordError(
        'vector_store',
        error instanceof Error ? error.message : 'Unknown error'
      )
      throw error
    }
  }

  async storeVectorsBatch(
    vectors: Array<{ vector: number[]; metadata: VectorMetadata }>,
    namespace?: string
  ) {
    if (!this.pineconeIndex) {
      throw new Error('VectorStore not initialized')
    }

    const operationId = this.generateId()
    monitoring.startOperation(operationId)

    try {
      // Deduplicate vectors
      const uniqueVectors = vectors.filter(
        (v, i, self) =>
          i ===
          self.findIndex(
            t =>
              t.vector.length === v.vector.length && t.vector.every((val, j) => val === v.vector[j])
          )
      )

      // Process in optimized batch sizes
      const BATCH_SIZE = 100
      const batchPromises = []
      for (let i = 0; i < uniqueVectors.length; i += BATCH_SIZE) {
        const batch = uniqueVectors.slice(i, i + BATCH_SIZE)
        const promise = this.pineconeIndex.upsert({
          upsertRequest: {
            vectors: batch.map(v => ({
              id: this.generateId(),
              values: v.vector,
              metadata: v.metadata,
            })),
            namespace,
          },
        })
        batchPromises.push(promise)

        // Process batches in parallel but with limits
        if (batchPromises.length >= 5) {
          await Promise.all(batchPromises)
          batchPromises.length = 0
        }
      }

      // Process any remaining batches
      if (batchPromises.length > 0) {
        await Promise.all(batchPromises)
      }

      monitoring.endOperation(operationId, 'vector_store_batch_upsert')
    } catch (error) {
      monitoring.recordError(
        'vector_store',
        error instanceof Error ? error.message : 'Unknown error'
      )
      throw error
    }
  }

  async findSimilar<T extends VectorMetadata>(
    vector: number[],
    options?: {
      namespace?: string
      topK?: number
      minScore?: number
      filter?: Record<string, unknown>
    }
  ): Promise<QueryMatch<T>[]> {
    if (!this.pineconeIndex) {
      throw new Error('VectorStore not initialized')
    }

    const operationId = this.generateId()
    monitoring.startOperation(operationId)

    try {
      const results = (await this.pineconeIndex.query({
        queryRequest: {
          vector,
          topK: options?.topK || 10,
          namespace: options?.namespace,
          filter: options?.filter,
          includeMetadata: true,
        },
      })) as QueryResponse<T>

      const matches = results.matches || []
      const minScore = options?.minScore

      // Filter by minimum score if specified
      const filtered =
        typeof minScore === 'number'
          ? matches.filter(m => typeof m.score === 'number' && m.score >= minScore)
          : matches

      monitoring.endOperation(operationId, 'vector_store_query')
      return filtered
    } catch (error) {
      monitoring.recordError(
        'vector_store',
        error instanceof Error ? error.message : 'Unknown error'
      )
      throw error
    }
  }

  async storeCodeInsight(insight: CodeInsight, embedding: number[]) {
    const metadata: VectorMetadata = {
      ...insight,
      type: 'code-insight',
      timestamp: Date.now(),
    }
    await this.storeVector(embedding, metadata, 'insights')
  }

  async findSimilarInsights(
    embedding: number[],
    options?: {
      type?: string
      confidence?: number
      limit?: number
    }
  ): Promise<CodeInsight[]> {
    const filter: Record<string, unknown> = {
      type: 'code-insight',
    }

    if (options?.type) {
      filter.insightType = options.type
    }
    if (options?.confidence) {
      filter.confidence = { $gte: options.confidence }
    }

    const results = await this.findSimilar<CodeInsight & VectorMetadata>(embedding, {
      namespace: 'insights',
      topK: options?.limit || 10,
      filter,
    })

    return results.map(match => {
      if (!match.metadata) {
        throw new Error('Missing metadata in vector store result')
      }
      return match.metadata
    })
  }

  async storeLearningMetrics(metrics: LearningMetric[], embedding: number[]) {
    const metadata: VectorMetadata = {
      type: 'learning-metrics',
      metrics,
      timestamp: Date.now(),
    }
    await this.storeVector(embedding, metadata, 'learning')
  }

  async findSimilarLearningPatterns(
    embedding: number[],
    limit: number = 5
  ): Promise<LearningMetric[]> {
    const results = await this.findSimilar<VectorMetadata>(embedding, {
      namespace: 'learning',
      topK: limit,
      filter: { type: 'learning-metrics' },
    })

    return results.flatMap(match => {
      if (!match.metadata?.metrics) {
        return []
      }
      return match.metadata.metrics as LearningMetric[]
    })
  }

  async cleanup(retentionDays: number = 30) {
    if (!this.pineconeIndex) {
      throw new Error('VectorStore not initialized')
    }

    const operationId = this.generateId()
    monitoring.startOperation(operationId)

    try {
      const cutoffDate = Date.now() - retentionDays * 24 * 60 * 60 * 1000

      // Query for vectors to delete
      const oldVectors = await this.findSimilar<VectorMetadata>([], {
        filter: {
          timestamp: { $lt: cutoffDate },
        },
      })

      // Delete vectors in batches
      const BATCH_SIZE = 100
      for (let i = 0; i < oldVectors.length; i += BATCH_SIZE) {
        const batch = oldVectors.slice(i, i + BATCH_SIZE)
        await this.pineconeIndex.delete1({
          ids: batch.map(v => v.id),
        })
      }

      monitoring.endOperation(operationId, 'vector_store_cleanup')
    } catch (error) {
      monitoring.recordError(
        'vector_store',
        error instanceof Error ? error.message : 'Unknown error'
      )
      throw error
    }
  }
}

export const vectorStore = VectorStoreManager.getInstance()
