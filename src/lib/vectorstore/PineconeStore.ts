import { Pinecone } from '@pinecone-database/pinecone'
import type { CodeInsight, LearningMetric } from '../../types'

export interface VectorMetadata {
  id: string
  text: string
  [key: string]: unknown
}

export class PineconeStore {
  private client: Pinecone
  private index: Pinecone.Index<VectorMetadata>
  private dimensions: number
  private metric: string
  private indexName: string

  constructor() {
    this.client = new Pinecone({
      apiKey: import.meta.env.VITE_PINECONE_API_KEY,
      environment: import.meta.env.VITE_PINECONE_ENVIRONMENT,
    })

    this.indexName = import.meta.env.VITE_PINECONE_INDEX_NAME || 'agent-one'
    this.dimensions = parseInt(import.meta.env.VITE_PINECONE_DIMENSIONS || '3072')
    this.metric = import.meta.env.VITE_PINECONE_METRIC || 'cosine'
    this.index = this.client.index<VectorMetadata>(this.indexName)
  }

  async storeCodeInsight(insight: CodeInsight, embedding: number[]) {
    await this.index.upsert({
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

  async storeLearningMetric(metric: LearningMetric, embedding: number[]) {
    await this.index.upsert({
      vectors: [
        {
          id: metric.id,
          values: embedding,
          metadata: {
            type: 'learning-metric',
            ...metric,
            timestamp: Date.now(),
          },
        },
      ],
    })
  }

  async queryCodeInsights(embedding: number[], topK: number = 5) {
    const results = await this.index.query({
      vector: embedding,
      topK,
      filter: {
        type: 'code-insight',
      },
      includeMetadata: true,
    })

    return results.matches || []
  }

  async queryLearningMetrics(embedding: number[], topK: number = 5) {
    const results = await this.index.query({
      vector: embedding,
      topK,
      filter: {
        type: 'learning-metric',
      },
      includeMetadata: true,
    })

    return results.matches || []
  }
}
