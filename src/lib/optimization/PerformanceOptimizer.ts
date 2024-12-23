import { monitoring } from '../monitoring/MonitoringSystem';
import { firebasePerformance } from '../firebase/FirebasePerformance';
import { logger } from '../../utils/logger';
import { captureException } from '../../utils/sentry';
import { memoryUsage } from '../../utils/metrics';

interface OptimizationMetrics {
  cacheHitRate: number;
  averageLatency: number;
  errorRate: number;
  memoryUsage: number;
}

interface CacheAnalysis {
  frequentlyAccessed: string[];
  predictedAccess: string[];
  unusedEntries: string[];
}

interface PerformanceAnalysis {
  slowOperations: string[];
  highMemoryOperations: string[];
  frequentErrors: string[];
}

export class PerformanceOptimizer {
  private static instance: PerformanceOptimizer;
  private readonly OPTIMIZATION_INTERVAL = 300000; // 5 minutes
  private readonly CACHE_HIT_RATE_THRESHOLD = 0.8;
  private readonly LATENCY_THRESHOLD = 1000; // 1 second
  private readonly ERROR_RATE_THRESHOLD = 0.01; // 1%
  private readonly MEMORY_THRESHOLD = 1024; // 1GB
  private readonly MAX_BATCH_SIZE = 100;
  private readonly MIN_BATCH_SIZE = 10;

  private constructor() {
    this.startOptimizationLoop();
    this.startMetricsCollection();
  }

  private startOptimizationLoop(): void {
    setInterval(() => {
      this.optimizePerformance().catch(error => {
        logger.error('Performance optimization failed:', error);
        captureException(error);
      });
    }, this.OPTIMIZATION_INTERVAL);
  }

  private startMetricsCollection(): void {
    setInterval(() => {
      const usage = process.memoryUsage();
      memoryUsage.set({ type: 'heap' }, usage.heapUsed);
      memoryUsage.set({ type: 'rss' }, usage.rss);
    }, 60000); // Every minute
  }

  static getInstance(): PerformanceOptimizer {
    if (!PerformanceOptimizer.instance) {
      PerformanceOptimizer.instance = new PerformanceOptimizer();
    }
    return PerformanceOptimizer.instance;
  }

  private async getMetrics(): Promise<OptimizationMetrics> {
    try {
      const metrics = await monitoring.getMetrics();
      
      return {
        cacheHitRate: metrics.cacheHits / (metrics.cacheHits + metrics.cacheMisses),
        averageLatency: metrics.totalLatency / metrics.totalRequests,
        errorRate: metrics.errors / metrics.totalRequests,
        memoryUsage: process.memoryUsage().heapUsed / (1024 * 1024)
      };
    } catch (error) {
      logger.error('Failed to get metrics:', error);
      captureException(error);
      throw error;
    }
  }

  private async analyzeCacheUsage(): Promise<CacheAnalysis> {
    const metrics = await monitoring.getCacheMetrics();
    const accessPatterns = new Map<string, number>();
    
    // Analyze access patterns
    metrics.accesses.forEach(access => {
      const count = accessPatterns.get(access.key) || 0;
      accessPatterns.set(access.key, count + 1);
    });

    // Sort by access frequency
    const sortedEntries = Array.from(accessPatterns.entries())
      .sort(([, a], [, b]) => b - a);

    return {
      frequentlyAccessed: sortedEntries.slice(0, 10).map(([key]) => key),
      predictedAccess: this.predictNextAccesses(metrics.accesses),
      unusedEntries: metrics.keys.filter(key => !accessPatterns.has(key))
    };
  }

  private predictNextAccesses(accesses: Array<{ key: string; timestamp: number }>): string[] {
    // Simple prediction based on recent access patterns
    return accesses
      .slice(-100)
      .map(access => access.key)
      .filter((key, index, self) => self.indexOf(key) === index)
      .slice(0, 10);
  }

  private async optimizeCache(metrics: OptimizationMetrics): Promise<void> {
    if (metrics.cacheHitRate < this.CACHE_HIT_RATE_THRESHOLD) {
      logger.info('Optimizing cache due to low hit rate:', metrics.cacheHitRate);
      
      const analysis = await this.analyzeCacheUsage();
      
      // Pre-fetch predicted data
      await Promise.all(
        analysis.predictedAccess.map(key => this.preFetchData(key))
      );

      // Clean up unused entries
      await this.cleanupCache(analysis.unusedEntries);

      monitoring.recordMetric('cache_optimization', 1);
    }
  }

  private async preFetchData(key: string): Promise<void> {
    try {
      // Implement pre-fetching logic
      logger.debug('Pre-fetching data for key:', key);
    } catch (error) {
      logger.error('Failed to pre-fetch data:', error);
      captureException(error);
    }
  }

  private async cleanupCache(entries: string[]): Promise<void> {
    try {
      // Implement cache cleanup logic
      logger.debug('Cleaning up cache entries:', entries.length);
    } catch (error) {
      logger.error('Failed to cleanup cache:', error);
      captureException(error);
    }
  }

  public async optimizePerformance(): Promise<void> {
    try {
      const metrics = await this.getMetrics();
      
      await Promise.all([
        this.optimizeCache(metrics),
        this.optimizeLatency(metrics),
        this.optimizeErrorHandling(metrics),
        this.optimizeMemory(metrics)
      ]);

      monitoring.recordMetric('optimization_run', 1);
      logger.info('Performance optimization completed successfully');
    } catch (error) {
      logger.error('Performance optimization failed:', error);
      monitoring.recordError('performance_optimizer', error.message);
      captureException(error);
    }
  }
}

export const performanceOptimizer = PerformanceOptimizer.getInstance();
