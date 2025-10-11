/* eslint-env browser, node */
// Server-side only metrics
import type { Counter, Gauge, Histogram, Registry } from 'prom-client'
import { logger } from '../lib/logger'

interface MetricsState {
  register: Registry | null
  httpRequestDurationMicroseconds: Histogram<string> | null
  mlPredictionDuration: Histogram<string> | null
  agentProcessingTime: Histogram<string> | null
  memoryUsage: Gauge<string> | null
  cacheOperations: Counter<string> | null
  cacheSize: Gauge<string> | null
  errorCount: Counter<string> | null
  brainActivityGauge: Gauge<string> | null
  neuralNetworkMetrics: Gauge<string> | null
}

const metrics: MetricsState = {
  register: null,
  httpRequestDurationMicroseconds: null,
  mlPredictionDuration: null,
  agentProcessingTime: null,
  memoryUsage: null,
  cacheOperations: null,
  cacheSize: null,
  errorCount: null,
  brainActivityGauge: null,
  neuralNetworkMetrics: null,
}

// Initialize metrics in server environment
if (typeof window === 'undefined') {
  // Dynamic import for server-side only
  import('prom-client')
    .then(client => {
      // Create a Registry
      metrics.register = new client.Registry()

      // Add a default label which is added to all metrics
      metrics.register.setDefaultLabels({
        app: 'monkey-one',
      })

      // Enable the collection of default metrics
      client.collectDefaultMetrics({ register: metrics.register })

      // HTTP metrics
      metrics.httpRequestDurationMicroseconds = new client.Histogram({
        name: 'http_request_duration_ms',
        help: 'Duration of HTTP requests in milliseconds',
        labelNames: ['method', 'route', 'code'],
        buckets: [5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000],
      })

      // ML metrics
      metrics.mlPredictionDuration = new client.Histogram({
        name: 'ml_prediction_duration_ms',
        help: 'Duration of ML predictions in milliseconds',
        labelNames: ['model', 'type'],
        buckets: [10, 50, 100, 250, 500, 1000, 2500, 5000],
      })

      // Agent metrics
      metrics.agentProcessingTime = new client.Histogram({
        name: 'agent_processing_time_ms',
        help: 'Time taken by agents to process messages',
        labelNames: ['agent_type', 'operation'],
        buckets: [5, 10, 25, 50, 100, 250, 500, 1000],
      })

      // Memory metrics
      metrics.memoryUsage = new client.Gauge({
        name: 'memory_usage_bytes',
        help: 'Memory usage in bytes',
        labelNames: ['type'],
      })

      // Cache metrics
      metrics.cacheOperations = new client.Counter({
        name: 'cache_operations_total',
        help: 'Total number of cache operations',
        labelNames: ['operation', 'status'],
      })

      metrics.cacheSize = new client.Gauge({
        name: 'cache_size_bytes',
        help: 'Current size of cache in bytes',
      })

      // Error metrics
      metrics.errorCount = new client.Counter({
        name: 'error_count_total',
        help: 'Total number of errors',
        labelNames: ['type', 'component'],
      })

      // Brain metrics
      metrics.brainActivityGauge = new client.Gauge({
        name: 'brain_activity_level',
        help: 'Current brain activity level',
        labelNames: ['region'],
      })

      metrics.neuralNetworkMetrics = new client.Gauge({
        name: 'neural_network_metrics',
        help: 'Neural network performance metrics',
        labelNames: ['metric'],
      })

      // Register all metrics
      if (metrics.register) {
        Object.values(metrics).forEach(metric => {
          if (metric && metric !== metrics.register) {
            metrics.register?.registerMetric(metric)
          }
        })
      }
    })
    .catch((error: unknown) => {
      logger.error('Failed to initialize metrics:', error)
    })
} else {
  // Browser environment - provide mock implementations
  const histogramStub = {
    observe: () => { },
    startTimer: () => () => 0,
    labels: () => histogramStub,
    reset: () => { },
    get: () => ({})
  } as unknown as Histogram<string>

  const counterStub = {
    inc: () => { },
    labels: () => counterStub,
    reset: () => { },
    get: () => ({})
  } as unknown as Counter<string>

  const gaugeStub = {
    set: () => { },
    inc: () => { },
    dec: () => { },
    labels: () => gaugeStub,
    setToCurrentTime: () => { },
    startTimer: () => () => { }
  } as unknown as Gauge<string>

  metrics.register = {
    metrics: () => Promise.resolve(''),
    getMetricsAsJSON: () => Promise.resolve([]),
    getMetricsAsPrometheus: () => Promise.resolve(''),
    registerMetric: () => { },
    removeSingleMetric: () => { },
    clear: () => { },
    contentType: 'text/plain; version=0.0.4; charset=utf-8',
    getSingleMetric: () => undefined,
  } as unknown as Registry

  metrics.httpRequestDurationMicroseconds = histogramStub
  metrics.mlPredictionDuration = histogramStub
  metrics.agentProcessingTime = histogramStub
  metrics.memoryUsage = gaugeStub
  metrics.cacheOperations = counterStub
  metrics.cacheSize = gaugeStub
  metrics.errorCount = counterStub
  metrics.brainActivityGauge = gaugeStub
  metrics.neuralNetworkMetrics = gaugeStub
}

// Export metrics with proper types
export const {
  register,
  httpRequestDurationMicroseconds,
  mlPredictionDuration,
  agentProcessingTime,
  memoryUsage,
  cacheOperations,
  cacheSize,
  errorCount,
  brainActivityGauge,
  neuralNetworkMetrics,
} = metrics
