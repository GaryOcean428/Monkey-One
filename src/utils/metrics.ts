import * as client from 'prom-client';

// Create a Registry
const register = new client.Registry();

// Add a default label which is added to all metrics
register.setDefaultLabels({
  app: 'monkey-one'
});

// Enable the collection of default metrics
client.collectDefaultMetrics({ register });

// HTTP metrics
export const httpRequestDurationMicroseconds = new client.Histogram({
  name: 'http_request_duration_ms',
  help: 'Duration of HTTP requests in milliseconds',
  labelNames: ['method', 'route', 'code'],
  buckets: [5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000]
});

// ML metrics
export const mlPredictionDuration = new client.Histogram({
  name: 'ml_prediction_duration_ms',
  help: 'Duration of ML predictions in milliseconds',
  labelNames: ['model', 'type'],
  buckets: [10, 50, 100, 250, 500, 1000, 2500, 5000]
});

// Agent metrics
export const agentProcessingTime = new client.Histogram({
  name: 'agent_processing_time_ms',
  help: 'Time taken by agents to process messages',
  labelNames: ['agent_type', 'operation'],
  buckets: [5, 10, 25, 50, 100, 250, 500, 1000]
});

// Memory metrics
export const memoryUsage = new client.Gauge({
  name: 'memory_usage_bytes',
  help: 'Memory usage in bytes',
  labelNames: ['type']
});

// Cache metrics
export const cacheOperations = new client.Counter({
  name: 'cache_operations_total',
  help: 'Total number of cache operations',
  labelNames: ['operation', 'status']
});

export const cacheSize = new client.Gauge({
  name: 'cache_size_bytes',
  help: 'Current size of cache in bytes'
});

// Error metrics
export const errorCount = new client.Counter({
  name: 'error_count_total',
  help: 'Total number of errors',
  labelNames: ['type', 'component']
});

// Brain metrics
export const brainActivityGauge = new client.Gauge({
  name: 'brain_activity_level',
  help: 'Current brain activity level',
  labelNames: ['region']
});

export const neuralNetworkMetrics = new client.Gauge({
  name: 'neural_network_metrics',
  help: 'Neural network performance metrics',
  labelNames: ['metric']
});

// Register all metrics
register.registerMetric(httpRequestDurationMicroseconds);
register.registerMetric(mlPredictionDuration);
register.registerMetric(agentProcessingTime);
register.registerMetric(memoryUsage);
register.registerMetric(cacheOperations);
register.registerMetric(cacheSize);
register.registerMetric(errorCount);
register.registerMetric(brainActivityGauge);
register.registerMetric(neuralNetworkMetrics);

export { register };
