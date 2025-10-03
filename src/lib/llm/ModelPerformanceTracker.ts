import { logger } from '../utils/logger'
import { ModelProvider, TaskType, PerformanceMetrics } from '../types/models'

const METRICS_WINDOW = 100 // Number of data points to keep for rolling metrics

export class ModelPerformanceTracker {
  private static instance: ModelPerformanceTracker
  private metrics: Map<ModelProvider, PerformanceMetrics>
  private latencyHistory: Map<ModelProvider, number[]>
  private successHistory: Map<ModelProvider, boolean[]>
  private tokenHistory: Map<ModelProvider, number[]>
  private costHistory: Map<ModelProvider, number[]>
  private qualityHistory: Map<ModelProvider, Map<TaskType, number[]>>

  private constructor() {
    this.metrics = new Map()
    this.latencyHistory = new Map()
    this.successHistory = new Map()
    this.tokenHistory = new Map()
    this.costHistory = new Map()
    this.qualityHistory = new Map()
  }

  public static getInstance(): ModelPerformanceTracker {
    if (!ModelPerformanceTracker.instance) {
      ModelPerformanceTracker.instance = new ModelPerformanceTracker()
    }
    return ModelPerformanceTracker.instance
  }

  private initializeMetrics(provider: ModelProvider): void {
    if (!this.metrics.has(provider)) {
      this.metrics.set(provider, {
        successRate: 1,
        errorRate: 0,
        averageLatency: 0,
        tokenUsage: 0,
        costPerToken: 0,
        qualityScores: {}
      })
      this.latencyHistory.set(provider, [])
      this.successHistory.set(provider, [])
      this.tokenHistory.set(provider, [])
      this.costHistory.set(provider, [])
      this.qualityHistory.set(provider, new Map())
    }
  }

  public recordLatency(provider: ModelProvider, latency: number): void {
    this.initializeMetrics(provider)
    const history = this.latencyHistory.get(provider)!
    history.push(latency)
    if (history.length > METRICS_WINDOW) {
      history.shift()
    }
    
    const metrics = this.metrics.get(provider)!
    metrics.averageLatency = history.reduce((a, b) => a + b, 0) / history.length
    this.metrics.set(provider, metrics)
    
    logger.debug(`Recorded latency for ${provider}: ${latency}ms`)
  }

  public recordSuccess(provider: ModelProvider, tokens: number, cost: number): void {
    this.initializeMetrics(provider)
    const history = this.successHistory.get(provider)!
    history.push(true)
    if (history.length > METRICS_WINDOW) {
      history.shift()
    }

    const tokenHistory = this.tokenHistory.get(provider)!
    tokenHistory.push(tokens)
    if (tokenHistory.length > METRICS_WINDOW) {
      tokenHistory.shift()
    }

    const costHistory = this.costHistory.get(provider)!
    costHistory.push(cost)
    if (costHistory.length > METRICS_WINDOW) {
      costHistory.shift()
    }

    const metrics = this.metrics.get(provider)!
    metrics.successRate = history.filter(Boolean).length / history.length
    metrics.errorRate = 1 - metrics.successRate
    metrics.tokenUsage = tokenHistory.reduce((a, b) => a + b, 0)
    metrics.costPerToken = costHistory.reduce((a, b) => a + b, 0) / metrics.tokenUsage
    this.metrics.set(provider, metrics)

    logger.debug(`Recorded success for ${provider}`)
  }

  public recordError(provider: ModelProvider): void {
    this.initializeMetrics(provider)
    const history = this.successHistory.get(provider)!
    history.push(false)
    if (history.length > METRICS_WINDOW) {
      history.shift()
    }

    const metrics = this.metrics.get(provider)!
    metrics.successRate = history.filter(Boolean).length / history.length
    metrics.errorRate = 1 - metrics.successRate
    this.metrics.set(provider, metrics)

    logger.debug(`Recorded error for ${provider}`)
  }

  public recordQualityScore(provider: ModelProvider, taskType: TaskType, score: number): void {
    this.initializeMetrics(provider)
    if (!this.qualityHistory.get(provider)!.has(taskType)) {
      this.qualityHistory.get(provider)!.set(taskType, [])
    }

    const history = this.qualityHistory.get(provider)!.get(taskType)!
    history.push(score)
    if (history.length > METRICS_WINDOW) {
      history.shift()
    }

    const metrics = this.metrics.get(provider)!
    if (!metrics.qualityScores[taskType]) {
      metrics.qualityScores[taskType] = []
    }
    metrics.qualityScores[taskType] = history
    this.metrics.set(provider, metrics)

    logger.debug(`Recorded quality score for ${provider} on ${taskType}: ${score}`)
  }

  public getModelPerformance(provider: ModelProvider): PerformanceMetrics {
    this.initializeMetrics(provider)
    return this.metrics.get(provider)!
  }

  public resetMetrics(provider: ModelProvider): void {
    this.metrics.delete(provider)
    this.latencyHistory.delete(provider)
    this.successHistory.delete(provider)
    this.tokenHistory.delete(provider)
    this.costHistory.delete(provider)
    this.qualityHistory.delete(provider)
    this.initializeMetrics(provider)
    
    logger.info(`Reset metrics for ${provider}`)
  }

  public async estimateImpact(affectedFiles: string[]): Promise<number> {
    // Estimate performance impact of changes to given files
    // Returns a value between -1 (very negative) and 1 (very positive)
    // 0 means neutral impact
    
    let impactScore = 0;
    let fileCount = 0;
    
    for (const file of affectedFiles) {
      fileCount++;
      
      // Check file type and estimate impact
      if (file.includes('performance') || file.includes('optimization')) {
        impactScore += 0.3; // Likely positive impact
      } else if (file.includes('cache') || file.includes('memory')) {
        impactScore += 0.2; // Potentially positive impact
      } else if (file.includes('test')) {
        impactScore += 0.05; // Test changes have minimal impact
      } else if (file.includes('config') || file.includes('constant')) {
        impactScore += 0.1; // Configuration changes may help
      } else {
        // Neutral or unknown impact
        impactScore += 0;
      }
    }
    
    // Average the impact across all files
    const averageImpact = fileCount > 0 ? impactScore / fileCount : 0;
    
    // Normalize to -1 to 1 range (currently 0 to 1, so we're conservative)
    return Math.max(-1, Math.min(1, averageImpact));
  }
}
