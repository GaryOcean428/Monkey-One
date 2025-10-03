import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { PerformanceOptimizer } from '../../lib/optimization/PerformanceOptimizer'
import { monitoring } from '../../lib/monitoring/MonitoringSystem'

describe('PerformanceOptimizer', () => {
  let optimizer: PerformanceOptimizer

  beforeEach(() => {
    optimizer = PerformanceOptimizer.getInstance()
    vi.spyOn(monitoring, 'recordMetric').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('getMetrics', () => {
    it('should return valid optimization metrics', async () => {
      const metrics = await optimizer['getMetrics']()

      expect(metrics).toHaveProperty('cacheHitRate')
      expect(metrics).toHaveProperty('averageLatency')
      expect(metrics).toHaveProperty('errorRate')
      expect(metrics).toHaveProperty('memoryUsage')
    })
  })

  describe('optimizeCache', () => {
    it('should optimize cache when hit rate is low', async () => {
      const metrics = {
        cacheHitRate: 0.5,
        averageLatency: 100,
        errorRate: 0.01,
        memoryUsage: 500,
      }

      await optimizer['optimizeCache'](metrics)
      expect(monitoring.recordMetric).toHaveBeenCalledWith('cache_optimization', 1)
    })

    it('should not optimize cache when hit rate is high', async () => {
      const metrics = {
        cacheHitRate: 0.9,
        averageLatency: 100,
        errorRate: 0.01,
        memoryUsage: 500,
      }

      await optimizer['optimizeCache'](metrics)
      expect(monitoring.recordMetric).not.toHaveBeenCalledWith('cache_optimization', 1)
    })
  })

  describe('optimizeLatency', () => {
    it('should optimize when latency is high', async () => {
      const metrics = {
        cacheHitRate: 0.8,
        averageLatency: 2000,
        errorRate: 0.01,
        memoryUsage: 500,
      }

      await optimizer['optimizeLatency'](metrics)
      expect(monitoring.recordMetric).toHaveBeenCalledWith('latency_optimization', 1)
    })
  })

  describe('optimizeErrorHandling', () => {
    it('should optimize when error rate is high', async () => {
      const metrics = {
        cacheHitRate: 0.8,
        averageLatency: 100,
        errorRate: 0.02,
        memoryUsage: 500,
      }

      await optimizer['optimizeErrorHandling'](metrics)
      expect(monitoring.recordMetric).toHaveBeenCalledWith('error_handling_optimization', 1)
    })
  })

  describe('optimizeMemory', () => {
    it('should optimize when memory usage is high', async () => {
      const metrics = {
        cacheHitRate: 0.8,
        averageLatency: 100,
        errorRate: 0.01,
        memoryUsage: 2048,
      }

      await optimizer['optimizeMemory'](metrics)
      expect(monitoring.recordMetric).toHaveBeenCalledWith('memory_optimization', 1)
    })
  })

  describe('optimizePerformance', () => {
    it('should run all optimizations', async () => {
      await optimizer.optimizePerformance()
      expect(monitoring.recordMetric).toHaveBeenCalledWith('optimization_run', 1)
    })

    it('should handle optimization errors gracefully', async () => {
      vi.spyOn(optimizer as any, 'getMetrics').mockRejectedValueOnce(new Error('Test error'))

      await optimizer.optimizePerformance()
      expect(monitoring.recordError).toHaveBeenCalled()
    })
  })
})
