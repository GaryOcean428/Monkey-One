import { logger } from '../utils/logger';

export type ModelProvider = 
  | 'phi'           // Local Phi-3.5
  | 'o1'            // O1 Model (Supreme)
  | 'o1-mini'       // O1 Mini (Fast)
  | 'claude'        // Claude 3.5 Sonnet (Superior)
  | 'claude-haiku'  // Claude Haiku 3.5 (Fast)
  | 'grok'          // Grok 2 (Superior)
  | 'grok-40'       // Grok 40B Mini (Fast)
  | 'perplexity'    // Best for search
  | 'llama'         // Best for tools
  | 'groq'          // Fast inference
  | 'qwen';         // General purpose

export type TaskType = 
  | 'reasoning'
  | 'creativity'
  | 'coding'
  | 'search'
  | 'toolUse'
  | 'general';

interface PerformanceMetrics {
  latency: number[];        // Response times in ms
  errorRate: number;        // Error rate percentage
  successRate: number;      // Success rate percentage
  tokensPerSecond: number; // Processing speed
  costPerToken: number;    // Cost efficiency
  qualityScores: {         // Quality metrics (0-10)
    [key in TaskType]?: number[];
  };
  lastUpdated: number;     // Timestamp of last update
}

interface ModelStats {
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
  totalTokens: number;
  totalCost: number;
  averageLatency: number;
}

export class ModelPerformanceTracker {
  private static instance: ModelPerformanceTracker;
  private performanceData: Map<ModelProvider, PerformanceMetrics>;
  private modelStats: Map<ModelProvider, ModelStats>;
  private readonly METRICS_WINDOW = 1000; // Keep last 1000 measurements
  private readonly UPDATE_INTERVAL = 60000; // Update every minute
  private readonly QUALITY_DECAY = 0.95; // Decay factor for old quality scores

  private constructor() {
    this.performanceData = new Map();
    this.modelStats = new Map();
    this.initializeMetrics();
    this.startPeriodicUpdate();
  }

  static getInstance(): ModelPerformanceTracker {
    if (!ModelPerformanceTracker.instance) {
      ModelPerformanceTracker.instance = new ModelPerformanceTracker();
    }
    return ModelPerformanceTracker.instance;
  }

  private initializeMetrics() {
    const defaultMetrics: PerformanceMetrics = {
      latency: [],
      errorRate: 0,
      successRate: 100,
      tokensPerSecond: 0,
      costPerToken: 0,
      qualityScores: {},
      lastUpdated: Date.now()
    };

    const defaultStats: ModelStats = {
      totalCalls: 0,
      successfulCalls: 0,
      failedCalls: 0,
      totalTokens: 0,
      totalCost: 0,
      averageLatency: 0
    };

    const allModels: ModelProvider[] = [
      'phi', 'o1', 'o1-mini', 'claude', 'claude-haiku',
      'grok', 'grok-40', 'perplexity', 'llama', 'groq', 'qwen'
    ];

    allModels.forEach(model => {
      this.performanceData.set(model, { ...defaultMetrics });
      this.modelStats.set(model, { ...defaultStats });
    });
  }

  private startPeriodicUpdate() {
    setInterval(() => {
      this.updateMetrics();
    }, this.UPDATE_INTERVAL);
  }

  private updateMetrics() {
    this.performanceData.forEach((metrics, model) => {
      // Apply decay to quality scores
      Object.keys(metrics.qualityScores).forEach(task => {
        const scores = metrics.qualityScores[task as TaskType];
        if (scores && scores.length > 0) {
          const decayedScores = scores.map(score => score * this.QUALITY_DECAY);
          metrics.qualityScores[task as TaskType] = decayedScores;
        }
      });

      // Update error and success rates
      const stats = this.modelStats.get(model)!;
      if (stats.totalCalls > 0) {
        metrics.errorRate = (stats.failedCalls / stats.totalCalls) * 100;
        metrics.successRate = (stats.successfulCalls / stats.totalCalls) * 100;
      }

      // Update tokens per second and cost per token
      if (stats.totalTokens > 0) {
        metrics.tokensPerSecond = stats.totalTokens / (stats.averageLatency / 1000);
        metrics.costPerToken = stats.totalCost / stats.totalTokens;
      }

      metrics.lastUpdated = Date.now();
    });

    logger.info('Updated model performance metrics');
  }

  recordLatency(model: ModelProvider, latencyMs: number) {
    const metrics = this.performanceData.get(model)!;
    metrics.latency.push(latencyMs);
    if (metrics.latency.length > this.METRICS_WINDOW) {
      metrics.latency.shift();
    }

    const stats = this.modelStats.get(model)!;
    stats.totalCalls++;
    stats.averageLatency = metrics.latency.reduce((a, b) => a + b, 0) / metrics.latency.length;
  }

  recordSuccess(model: ModelProvider, tokens: number, cost: number) {
    const stats = this.modelStats.get(model)!;
    stats.successfulCalls++;
    stats.totalTokens += tokens;
    stats.totalCost += cost;
  }

  recordError(model: ModelProvider) {
    const stats = this.modelStats.get(model)!;
    stats.failedCalls++;
  }

  recordQualityScore(model: ModelProvider, taskType: TaskType, score: number) {
    const metrics = this.performanceData.get(model)!;
    if (!metrics.qualityScores[taskType]) {
      metrics.qualityScores[taskType] = [];
    }
    metrics.qualityScores[taskType]!.push(score);
    if (metrics.qualityScores[taskType]!.length > this.METRICS_WINDOW) {
      metrics.qualityScores[taskType]!.shift();
    }
  }

  getModelPerformance(model: ModelProvider): PerformanceMetrics {
    return this.performanceData.get(model)!;
  }

  getModelStats(model: ModelProvider): ModelStats {
    return this.modelStats.get(model)!;
  }

  getBestModelForTask(taskType: TaskType, maxLatency?: number): ModelProvider {
    let bestModel: ModelProvider = 'phi';
    let bestScore = -1;

    this.performanceData.forEach((metrics, model) => {
      if (maxLatency && metrics.latency.length > 0) {
        const avgLatency = metrics.latency.reduce((a, b) => a + b, 0) / metrics.latency.length;
        if (avgLatency > maxLatency) return;
      }

      const qualityScore = metrics.qualityScores[taskType]?.slice(-10) || [];
      if (qualityScore.length === 0) return;

      const avgQuality = qualityScore.reduce((a, b) => a + b, 0) / qualityScore.length;
      const successFactor = metrics.successRate / 100;
      const speedFactor = 1 / (1 + metrics.latency[metrics.latency.length - 1] / 1000);
      
      const score = avgQuality * successFactor * speedFactor;
      
      if (score > bestScore) {
        bestScore = score;
        bestModel = model;
      }
    });

    return bestModel;
  }

  getAllMetrics(): Record<ModelProvider, PerformanceMetrics> {
    const metrics: Record<ModelProvider, PerformanceMetrics> = {} as Record<ModelProvider, PerformanceMetrics>;
    this.performanceData.forEach((value, key) => {
      metrics[key] = value;
    });
    return metrics;
  }
}
