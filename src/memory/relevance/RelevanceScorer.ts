import { SearchResult } from '../vector/types'

interface RelevanceFactors {
  temporalWeight: number
  contextualWeight: number
  frequencyWeight: number
  sourceWeight: number
  tagWeight: number
}

export interface RelevanceMetrics {
  temporalScore: number
  contextualScore: number
  frequencyScore: number
  sourceScore: number
  tagScore: number
  finalScore: number
}

const DEFAULT_FACTORS: RelevanceFactors = {
  temporalWeight: 0.3,
  contextualWeight: 0.3,
  frequencyWeight: 0.15,
  sourceWeight: 0.15,
  tagWeight: 0.1,
}

export class RelevanceScorer {
  private factors: RelevanceFactors
  private sourceReliability: Map<string, number>
  private usageFrequency: Map<string, number>

  constructor(
    factors: Partial<RelevanceFactors> = {},
    private maxAge: number = 30 * 24 * 60 * 60 * 1000 // 30 days in milliseconds
  ) {
    this.factors = { ...DEFAULT_FACTORS, ...factors }
    this.sourceReliability = new Map()
    this.usageFrequency = new Map()
    this.initializeSourceReliability()
  }

  private initializeSourceReliability(): void {
    // Initialize source reliability scores (0-1)
    this.sourceReliability.set('user_input', 0.9)
    this.sourceReliability.set('agent_generated', 0.8)
    this.sourceReliability.set('system_generated', 0.95)
    this.sourceReliability.set('consolidation', 0.85)
    this.sourceReliability.set('external', 0.7)
  }

  public calculateRelevance(
    result: SearchResult,
    queryContext: {
      timestamp: number
      tags?: string[]
      source?: string
    }
  ): RelevanceMetrics {
    const metadata = result.metadata

    // Calculate individual scores
    const temporalScore = this.calculateTemporalScore(metadata.timestamp, queryContext.timestamp)
    const contextualScore = result.score // Base similarity score from vector search
    const frequencyScore = this.calculateFrequencyScore(metadata.id)
    const sourceScore = this.calculateSourceScore(metadata.source)
    const tagScore = this.calculateTagScore(metadata.tags, queryContext.tags)

    // Calculate final weighted score
    const finalScore =
      temporalScore * this.factors.temporalWeight +
      contextualScore * this.factors.contextualWeight +
      frequencyScore * this.factors.frequencyWeight +
      sourceScore * this.factors.sourceWeight +
      tagScore * this.factors.tagWeight

    // Update usage frequency
    this.updateUsageFrequency(metadata.id)

    return {
      temporalScore,
      contextualScore,
      frequencyScore,
      sourceScore,
      tagScore,
      finalScore,
    }
  }

  private calculateTemporalScore(timestamp: number, queryTimestamp: number): number {
    const age = queryTimestamp - timestamp
    // Normalize age to a 0-1 score (1 being most recent)
    return Math.max(0, 1 - age / this.maxAge)
  }

  private calculateFrequencyScore(id: string): number {
    const frequency = this.usageFrequency.get(id) || 0
    // Normalize frequency to a 0-1 score using a logarithmic scale
    return Math.min(1, Math.log10(frequency + 1) / Math.log10(100))
  }

  private calculateSourceScore(source: string): number {
    return this.sourceReliability.get(source) || 0.5
  }

  private calculateTagScore(itemTags?: string[], queryTags?: string[]): number {
    if (!itemTags || !queryTags || queryTags.length === 0) {
      return 0.5 // Neutral score if no tags to compare
    }

    const matchingTags = queryTags.filter(tag => itemTags.includes(tag))
    return matchingTags.length / queryTags.length
  }

  private updateUsageFrequency(id: string): void {
    const currentFreq = this.usageFrequency.get(id) || 0
    this.usageFrequency.set(id, currentFreq + 1)
  }

  public getUsageFrequency(id: string): number {
    return this.usageFrequency.get(id) || 0
  }

  public setSourceReliability(source: string, score: number): void {
    if (score < 0 || score > 1) {
      throw new Error('Source reliability score must be between 0 and 1')
    }
    this.sourceReliability.set(source, score)
  }

  public adjustFactors(newFactors: Partial<RelevanceFactors>): void {
    this.factors = { ...this.factors, ...newFactors }

    // Ensure weights sum to 1
    const sum = Object.values(this.factors).reduce((a, b) => a + b, 0)
    if (Math.abs(sum - 1) > 0.001) {
      const normalizer = 1 / sum
      Object.keys(this.factors).forEach(key => {
        this.factors[key as keyof RelevanceFactors] *= normalizer
      })
    }
  }
}
