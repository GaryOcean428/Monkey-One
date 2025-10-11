import type { CodeInsight, LearningMetric } from '../../types'
import { vectorStore } from '../vectorstore'

export class PineconeStore {
  async initialize(): Promise<void> {
    // No-op for in-memory implementation, preserved for compatibility
  }

  async storeCodeInsight(insight: CodeInsight, embedding: number[]): Promise<void> {
    await vectorStore.storeInsight(
      {
        id: insight.id,
        type: insight.type ?? 'code-insight',
        content: insight.content,
        metadata: insight.metadata ?? {},
        timestamp: new Date(
          typeof insight.timestamp === 'number' ? insight.timestamp : Date.now()
        ).toISOString(),
      },
      embedding
    )
  }

  async storeLearningMetric(metric: LearningMetric, embedding: number[]): Promise<void> {
    await vectorStore.storeLearningMetrics(
      [
        {
          id: metric.id,
          metricType: metric.type ?? metric.category ?? 'learning_metric',
          value: metric.value,
          metadata: metric.metadata ?? {},
          timestamp: new Date(
            typeof metric.timestamp === 'number' ? metric.timestamp : Date.now()
          ).toISOString(),
        },
      ],
      embedding
    )
  }

  async storeLearningMetrics(metrics: LearningMetric[], embedding: number[]): Promise<void> {
    for (const metric of metrics) {
      await this.storeLearningMetric(metric, embedding)
    }
  }

  async findSimilarInsights(embedding: number[], options?: { type?: string; limit?: number }) {
    const results = await vectorStore.findSimilarInsights(embedding, {
      type: options?.type ?? 'code-insight',
      limit: options?.limit,
    })
    return results
  }

  async findSimilarLearningPatterns(embedding: number[], limit?: number) {
    const results = await vectorStore.findSimilarLearningPatterns(embedding, limit)
    return results
  }

  async deleteOldInsights(_cutoffDate: Date): Promise<void> {
    // In-memory implementation does not persist historical data separately
  }
}
