import { Pinecone } from '@pinecone-database/pinecone'
import type { CodeInsight, LearningMetric } from '../../types'

export class PineconeStore {
  private client: Pinecone
  private indexName: string
  private dimensions: number
  private metric: string

  constructor() {
    this.client = new Pinecone({
      apiKey: import.meta.env.VITE_PINECONE_API_KEY,
      environment: import.meta.env.VITE_PINECONE_ENVIRONMENT,
    })

    this.indexName = import.meta.env.VITE_PINECONE_INDEX_NAME || 'agent-one'
    this.dimensions = parseInt(import.meta.env.VITE_PINECONE_DIMENSIONS || '3072')
    this.metric = import.meta.env.VITE_PINECONE_METRIC || 'cosine'
  }

  async storeCodeInsight(insight: CodeInsight, embedding: number[]) {
    const index = this.client.Index(this.indexName)
    await index.upsert({
      vectors: [
        {
          id: insight.id,
          values: embedding,
          metadata: {
            type: 'code-insight',
            ...insight,
            timestamp: Date.now(),
          },
        },
      ],
    })
  }

  async findSimilarInsights(
    embedding: number[],
    options?: {
      type?: string
      confidence?: number
      limit?: number
    }
  ): Promise<CodeInsight[]> {
    const index = this.client.Index(this.indexName)
    const response = await index.query({
      vector: embedding,
      topK: options?.limit || 5,
      includeMetadata: true,
      filter: {
        type: 'code-insight',
        ...(options?.confidence && { confidence: { $gte: options.confidence } }),
      },
    })

    return response.matches
      .filter(match => match.metadata)
      .map(match => ({
        id: match.id,
        ...(match.metadata as CodeInsight),
      }))
  }

  async storeLearningMetrics(metrics: LearningMetric[], embedding: number[]) {
    const index = this.client.Index(this.indexName)
    const vectors = metrics.map(metric => ({
      id: metric.id,
      values: embedding,
      metadata: {
        type: 'learning-metric',
        ...metric,
        timestamp: Date.now(),
      },
    }))

    await index.upsert({ vectors })
  }

  async findSimilarLearningPatterns(
    embedding: number[],
    limit: number = 5
  ): Promise<LearningMetric[]> {
    const index = this.client.Index(this.indexName)
    const response = await index.query({
      vector: embedding,
      topK: limit,
      includeMetadata: true,
      filter: { type: 'learning-metric' },
    })

    return response.matches
      .filter(match => match.metadata)
      .map(match => ({
        id: match.id,
        ...(match.metadata as LearningMetric),
      }))
  }

  async deleteOldInsights(cutoffDate: number) {
    const index = this.client.Index(this.indexName)
    await index.deleteMany({
      filter: {
        timestamp: { $lt: cutoffDate },
      },
    })
  }
}
