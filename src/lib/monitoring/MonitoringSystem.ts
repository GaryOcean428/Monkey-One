import { logger } from '../../utils/logger'
import { captureException } from '../../utils/sentry'
import {
  memoryUsage,
  agentProcessingTime,
  cacheOperations,
  cacheSize,
  errorCount,
  brainActivityGauge,
  neuralNetworkMetrics,
} from '../../utils/metrics'

type EventListener = (...args: unknown[]) => void

/**
 * MonitoringSystem provides centralized monitoring and metrics collection
 * for the entire application. It handles performance tracking, resource
 * utilization, and system health monitoring.
 */
export class MonitoringSystem {
  private static instance: MonitoringSystem
  private readonly METRICS_INTERVAL = 60000 // 1 minute
  private readonly CLEANUP_INTERVAL = 3600000 // 1 hour
  private metricsTimer?: number
  private cleanupTimer?: number
  private metrics: Map<string, number> = new Map()
  private operationTimers: Map<string, number> = new Map()
  private listeners: { [event: string]: EventListener[] } = {}

  private constructor() {
    this.startMetricsCollection()
    this.startCleanupInterval()
  }

  public static getInstance(): MonitoringSystem {
    if (!MonitoringSystem.instance) {
      MonitoringSystem.instance = new MonitoringSystem()
    }
    return MonitoringSystem.instance
  }

  private startMetricsCollection(): void {
    try {
      this.collectSystemMetrics()
      const interval = typeof window !== 'undefined' ? window.setInterval : setInterval
      this.metricsTimer = interval(() => {
        this.collectSystemMetrics()
      }, this.METRICS_INTERVAL)
    } catch (error) {
      logger.error('Failed to start metrics collection:', error)
      captureException(error)
    }
  }

  private startCleanupInterval(): void {
    try {
      const interval = typeof window !== 'undefined' ? window.setInterval : setInterval
      this.cleanupTimer = interval(() => {
        this.cleanupOldMetrics()
      }, this.CLEANUP_INTERVAL)
    } catch (error) {
      logger.error('Failed to start cleanup interval:', error)
      captureException(error)
    }
  }

  /**
   * Collects system metrics at regular intervals
   */
  private collectSystemMetrics(): void {
    try {
      // Memory metrics with thresholds
      let memoryMetrics

      if (typeof window !== 'undefined' && window.performance?.memory) {
        // Browser environment
        const memUsage = window.performance.memory
        memoryMetrics = {
          heapUsed: memUsage.usedJSHeapSize,
          heapTotal: memUsage.totalJSHeapSize,
          heapLimit: memUsage.jsHeapSizeLimit,
        }
      } else if (typeof process !== 'undefined') {
        // Node.js environment
        const memUsage = process.memoryUsage()
        memoryMetrics = {
          heapUsed: memUsage.heapUsed,
          heapTotal: memUsage.heapTotal,
          external: memUsage.external,
          rss: memUsage.rss,
        }
      } else {
        // Fallback metrics
        memoryMetrics = {
          heapUsed: 0,
          heapTotal: 0,
          external: 0,
          rss: 0,
        }
      }

      // Set memory metrics
      Object.entries(memoryMetrics).forEach(([key, value]) => {
        memoryUsage.set({ type: key }, value)
      })

      // Trigger cleanup if memory usage is high (75% of total)
      if (memoryMetrics.heapUsed > memoryMetrics.heapTotal * 0.75) {
        this.cleanupOldMetrics()
      }

      // Cache metrics with optimization
      const cacheStats = this.getCacheStats()
      if (cacheStats) {
        cacheOperations.inc({ type: 'read' }, cacheStats.reads)
        cacheOperations.inc({ type: 'write' }, cacheStats.writes)
        cacheSize.set(cacheStats.size)
      }

      // Error tracking
      const errors = this.getErrorStats()
      if (errors) {
        errorCount.inc({ type: 'system' }, errors.system)
        errorCount.inc({ type: 'user' }, errors.user)
      }

      // Brain activity metrics
      const brainStats = this.getBrainStats()
      if (brainStats) {
        brainActivityGauge.set({ type: 'neurons' }, brainStats.activeNeurons)
        brainActivityGauge.set({ type: 'synapses' }, brainStats.activeSynapses)
      }

      // Neural network performance
      const nnStats = this.getNeuralNetworkStats()
      if (nnStats) {
        neuralNetworkMetrics.set({ type: 'accuracy' }, nnStats.accuracy)
        neuralNetworkMetrics.set({ type: 'loss' }, nnStats.loss)
      }

      this.emit('metrics_collected', {
        memory: memoryMetrics,
        cache: cacheStats,
        errors,
        brain: brainStats,
        neuralNetwork: nnStats,
      })
    } catch (error) {
      logger.error('Error collecting system metrics:', error)
      captureException(error)
    }
  }

  private cleanupOldMetrics(): void {
    const now = Date.now()
    let cleanedCount = 0

    // Remove old entries
    for (const [key, value] of this.metrics.entries()) {
      if (now - value > 3600000) {
        // 1 hour
        this.metrics.delete(key)
        cleanedCount++
      }
    }

    // Clear old operation timers
    this.operationTimers.clear()

    logger.info(`Cleaned up ${cleanedCount} old metrics`)
  }

  private getCacheStats() {
    return {
      reads: 0,
      writes: 0,
      size: this.metrics.size,
    }
  }

  private getErrorStats() {
    return {
      system: 0,
      user: 0,
    }
  }

  private getBrainStats() {
    return {
      activeNeurons: 0,
      activeSynapses: 0,
    }
  }

  private getNeuralNetworkStats() {
    return {
      accuracy: 0,
      loss: 0,
    }
  }

  public startOperation(operationId: string): void {
    this.operationTimers.set(operationId, Date.now())
  }

  public endOperation(operationId: string): void {
    const startTime = this.operationTimers.get(operationId)
    if (startTime) {
      const duration = Date.now() - startTime
      agentProcessingTime.observe({ operation: operationId }, duration)
      this.operationTimers.delete(operationId)
    }
  }

  public recordMetric(name: string, value: number): void {
    this.metrics.set(name, value)
  }

  public cleanup(): void {
    if (this.metricsTimer) window.clearInterval(this.metricsTimer)
    if (this.cleanupTimer) window.clearInterval(this.cleanupTimer)
    this.metrics.clear()
    this.operationTimers.clear()
    this.removeAllListeners()
  }

  public on(event: string, listener: EventListener): void {
    if (!this.listeners[event]) {
      this.listeners[event] = []
    }
    this.listeners[event].push(listener)
  }

  public emit(event: string, data: unknown): void {
    if (this.listeners[event]) {
      this.listeners[event].forEach(listener => {
        try {
          listener(data)
        } catch (error) {
          captureException(error as Error)
        }
      })
    }
  }

  public removeAllListeners(): void {
    this.listeners = {}
  }
}

export const monitoring = MonitoringSystem.getInstance()
