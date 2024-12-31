import { EventEmitter } from 'events';
import { logger } from '../../utils/logger';
import { captureException } from '../../utils/sentry';
import {
  memoryUsage,
  agentProcessingTime,
  cacheOperations,
  cacheSize,
  errorCount,
  brainActivityGauge,
  neuralNetworkMetrics
} from '../../utils/metrics';

/**
 * MonitoringSystem provides centralized monitoring and metrics collection
 * for the entire application. It handles performance tracking, resource
 * utilization, and system health monitoring.
 */
export class MonitoringSystem extends EventEmitter {
  private static instance: MonitoringSystem;
  private readonly METRICS_INTERVAL = 60000; // 1 minute
  private readonly CLEANUP_INTERVAL = 3600000; // 1 hour
  private metricsTimer: NodeJS.Timer;
  private cleanupTimer: NodeJS.Timer;
  private metrics: Map<string, number> = new Map();
  private operationTimers: Map<string, number> = new Map();

  private constructor() {
    super();
    this.startMetricsCollection();
    this.startCleanupInterval();
  }

  /**
   * Gets the singleton instance of MonitoringSystem
   */
  static getInstance(): MonitoringSystem {
    if (!MonitoringSystem.instance) {
      MonitoringSystem.instance = new MonitoringSystem();
    }
    return MonitoringSystem.instance;
  }

  /**
   * Starts periodic metrics collection
   */
  private startMetricsCollection(): void {
    this.metricsTimer = setInterval(() => {
      try {
        this.collectSystemMetrics();
      } catch (error) {
        logger.error('Failed to collect metrics:', error);
        captureException(error);
      }
    }, this.METRICS_INTERVAL);
  }

  /**
   * Starts periodic cleanup of old metrics
   */
  private startCleanupInterval(): void {
    this.cleanupTimer = setInterval(() => {
      try {
        this.cleanupOldMetrics();
      } catch (error) {
        logger.error('Failed to cleanup metrics:', error);
        captureException(error);
      }
    }, this.CLEANUP_INTERVAL);
  }

  /**
   * Collects system-wide metrics
   */
  private collectSystemMetrics(): void {
    try {
      // Memory metrics with thresholds
      const memUsage = process.memoryUsage();
      const heapUsed = memUsage.heapUsed;
      memoryUsage.set({ type: 'heap' }, heapUsed);
      memoryUsage.set({ type: 'rss' }, memUsage.rss);
      memoryUsage.set({ type: 'external' }, memUsage.external);

      // Trigger cleanup if memory usage is high
      if (heapUsed > 1024 * 1024 * 1024) { // 1GB
        this.cleanupOldMetrics();
        global.gc?.(); // Optional GC if available
      }

      // Cache metrics with optimization
      const cacheStats = this.getCacheStats();
      if (cacheStats.size > 10000) { // Too many entries
        this.optimizeCache();
      }
      cacheSize.set(cacheStats.size);
      cacheOperations.inc({ operation: 'cleanup', status: 'success' });

      // Brain activity metrics with batching
      this.collectBrainMetrics();

      // Log performance issues
      if (this.metrics.get('latency') > 1000) {
        logger.warn('High latency detected');
      }
    } catch (error) {
      logger.error('Failed to collect metrics:', error);
      captureException(error);
    }
  }

  private optimizeCache(): void {
    const now = Date.now();
    let cleanedCount = 0;
    
    // Remove old entries
    for (const [key, value] of this.metrics.entries()) {
      if (now - value.timestamp > 3600000) { // 1 hour
        this.metrics.delete(key);
        cleanedCount++;
      }
    }
    
    logger.info(`Cleaned ${cleanedCount} old cache entries`);
  }

  /**
   * Collects brain-specific metrics
   */
  private collectBrainMetrics(): void {
    const regions = ['amygdala', 'cerebellum', 'thalamus', 'hippocampus'];
    regions.forEach(region => {
      const activity = Math.random(); // Replace with actual activity measurement
      brainActivityGauge.set({ region }, activity);
    });

    // Neural network performance metrics
    const networkMetrics = {
      accuracy: this.metrics.get('accuracy') || 0,
      loss: this.metrics.get('loss') || 0,
      learningRate: this.metrics.get('learningRate') || 0
    };

    Object.entries(networkMetrics).forEach(([metric, value]) => {
      neuralNetworkMetrics.set({ metric }, value);
    });
  }

  /**
   * Gets current cache statistics
   */
  private getCacheStats(): { size: number; hitRate: number } {
    return {
      size: this.metrics.size * 100, // Approximate size in bytes
      hitRate: (this.metrics.get('cacheHits') || 0) / 
               (this.metrics.get('cacheTotal') || 1)
    };
  }

  /**
   * Records a metric value
   * @param name - Metric name
   * @param value - Metric value
   */
  public recordMetric(name: string, value: number): void {
    this.metrics.set(name, value);
    this.emit('metric', { name, value });
  }

  /**
   * Records the start of an operation
   * @param operationId - Unique operation identifier
   */
  public startOperation(operationId: string): void {
    this.operationTimers.set(operationId, Date.now());
  }

  /**
   * Records the end of an operation and its duration
   * @param operationId - Operation identifier
   * @param type - Type of operation
   */
  public endOperation(operationId: string, type: string): void {
    const startTime = this.operationTimers.get(operationId);
    if (startTime) {
      const duration = Date.now() - startTime;
      agentProcessingTime.observe({ operation: type }, duration);
      this.operationTimers.delete(operationId);
    }
  }

  /**
   * Records an error occurrence
   * @param type - Error type
   * @param message - Error message
   */
  public recordError(type: string, message: string): void {
    errorCount.inc({ type });
    logger.error(`${type} error: ${message}`);
    this.emit('error', { type, message });
  }

  /**
   * Cleans up old metrics to prevent memory leaks
   */
  private cleanupOldMetrics(): void {
    const now = Date.now();
    
    // Clean up old operation timers
    for (const [operationId, startTime] of this.operationTimers.entries()) {
      if (now - startTime > 3600000) { // 1 hour timeout
        this.operationTimers.delete(operationId);
        this.recordError('operation_timeout', `Operation ${operationId} timed out`);
      }
    }

    // Reset accumulated metrics
    this.metrics.clear();
  }

  /**
   * Cleans up resources
   */
  public cleanup(): void {
    clearInterval(this.metricsTimer);
    clearInterval(this.cleanupTimer);
    this.metrics.clear();
    this.operationTimers.clear();
    this.removeAllListeners();
  }
}

export const monitoring = MonitoringSystem.getInstance();
