import { logger } from '../../utils/logger';

export interface PerformanceMetrics {
  requestLatency: number[];
  tokenProcessingSpeed: number[];
  memoryUsage: number[];
  timestamp: number[];
}

export interface DetailedModelMetrics {
  p50Latency: number;
  p90Latency: number;
  p99Latency: number;
  avgTokensPerSecond: number;
  peakMemoryUsage: number;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  timeoutRequests: number;
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, PerformanceMetrics> = new Map();
  private readonly maxDataPoints = 1000;

  private constructor() {
    this.startPeriodicCleanup();
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  private startPeriodicCleanup() {
    setInterval(() => {
      this.cleanup();
    }, 3600000); // Cleanup every hour
  }

  private cleanup() {
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    for (const [modelName, modelMetrics] of this.metrics.entries()) {
      const oldestAllowedIndex = modelMetrics.timestamp.findIndex(
        time => now - time < maxAge
      );

      if (oldestAllowedIndex > 0) {
        modelMetrics.requestLatency = modelMetrics.requestLatency.slice(oldestAllowedIndex);
        modelMetrics.tokenProcessingSpeed = modelMetrics.tokenProcessingSpeed.slice(oldestAllowedIndex);
        modelMetrics.memoryUsage = modelMetrics.memoryUsage.slice(oldestAllowedIndex);
        modelMetrics.timestamp = modelMetrics.timestamp.slice(oldestAllowedIndex);
      }

      if (modelMetrics.timestamp.length === 0) {
        this.metrics.delete(modelName);
      }
    }
  }

  recordMetrics(
    modelName: string,
    latency: number,
    tokensPerSecond: number,
    memoryUsage: number
  ) {
    const modelMetrics = this.metrics.get(modelName) || {
      requestLatency: [],
      tokenProcessingSpeed: [],
      memoryUsage: [],
      timestamp: []
    };

    modelMetrics.requestLatency.push(latency);
    modelMetrics.tokenProcessingSpeed.push(tokensPerSecond);
    modelMetrics.memoryUsage.push(memoryUsage);
    modelMetrics.timestamp.push(Date.now());

    // Trim arrays if they exceed maxDataPoints
    if (modelMetrics.timestamp.length > this.maxDataPoints) {
      const excess = modelMetrics.timestamp.length - this.maxDataPoints;
      modelMetrics.requestLatency = modelMetrics.requestLatency.slice(excess);
      modelMetrics.tokenProcessingSpeed = modelMetrics.tokenProcessingSpeed.slice(excess);
      modelMetrics.memoryUsage = modelMetrics.memoryUsage.slice(excess);
      modelMetrics.timestamp = modelMetrics.timestamp.slice(excess);
    }

    this.metrics.set(modelName, modelMetrics);
  }

  getDetailedMetrics(modelName: string): DetailedModelMetrics {
    const metrics = this.metrics.get(modelName);
    if (!metrics || metrics.requestLatency.length === 0) {
      return {
        p50Latency: 0,
        p90Latency: 0,
        p99Latency: 0,
        avgTokensPerSecond: 0,
        peakMemoryUsage: 0,
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        timeoutRequests: 0
      };
    }

    const sortedLatencies = [...metrics.requestLatency].sort((a, b) => a - b);
    const p50Index = Math.floor(sortedLatencies.length * 0.5);
    const p90Index = Math.floor(sortedLatencies.length * 0.9);
    const p99Index = Math.floor(sortedLatencies.length * 0.99);

    return {
      p50Latency: sortedLatencies[p50Index],
      p90Latency: sortedLatencies[p90Index],
      p99Latency: sortedLatencies[p99Index],
      avgTokensPerSecond: metrics.tokenProcessingSpeed.reduce((a, b) => a + b, 0) / metrics.tokenProcessingSpeed.length,
      peakMemoryUsage: Math.max(...metrics.memoryUsage),
      totalRequests: metrics.requestLatency.length,
      successfulRequests: metrics.requestLatency.filter(l => l < 10000).length, // Assuming >10s is a failure
      failedRequests: metrics.requestLatency.filter(l => l >= 10000).length,
      timeoutRequests: metrics.requestLatency.filter(l => l >= 30000).length
    };
  }

  getMetricsTimeSeries(modelName: string, timeRange: number = 3600000): PerformanceMetrics {
    const metrics = this.metrics.get(modelName);
    if (!metrics) {
      return {
        requestLatency: [],
        tokenProcessingSpeed: [],
        memoryUsage: [],
        timestamp: []
      };
    }

    const now = Date.now();
    const startIndex = metrics.timestamp.findIndex(time => now - time <= timeRange);
    
    if (startIndex === -1) return metrics;

    return {
      requestLatency: metrics.requestLatency.slice(startIndex),
      tokenProcessingSpeed: metrics.tokenProcessingSpeed.slice(startIndex),
      memoryUsage: metrics.memoryUsage.slice(startIndex),
      timestamp: metrics.timestamp.slice(startIndex)
    };
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance();
