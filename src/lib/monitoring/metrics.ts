import { monitoring } from './MonitoringService';

export const metrics = {
  // Database metrics
  async recordQueryMetrics(operation: string, durationMs: number, metadata: Record<string, any> = {}) {
    await monitoring.recordMetric(`database.query.${operation}`, durationMs, {
      ...metadata,
      timestamp: Date.now()
    });
  },

  async recordRowCount(table: string, count: number) {
    await monitoring.recordMetric(`database.rows.${table}`, count);
  },

  // Cache metrics
  async recordCacheMetrics(operation: 'hit' | 'miss' | 'set', durationMs: number, metadata: Record<string, any> = {}) {
    await monitoring.recordMetric(`cache.${operation}`, durationMs, metadata);
    if (operation === 'miss') {
      await monitoring.recordMetric('cache.miss_ratio', 1, metadata);
    } else if (operation === 'hit') {
      await monitoring.recordMetric('cache.hit_ratio', 1, metadata);
    }
  },

  async recordCacheSize(namespace: string, size: number) {
    await monitoring.recordMetric(`cache.size.${namespace}`, size);
  },

  // Performance metrics
  async recordLatency(operation: string, durationMs: number, metadata: Record<string, any> = {}) {
    await monitoring.recordMetric(`latency.${operation}`, durationMs, metadata);
  },

  async recordThroughput(operation: string, count: number = 1) {
    await monitoring.recordMetric(`throughput.${operation}`, count);
  },

  // Memory metrics
  async recordMemoryUsage() {
    const usage = process.memoryUsage();
    await Promise.all([
      monitoring.recordMetric('memory.heapUsed', usage.heapUsed),
      monitoring.recordMetric('memory.heapTotal', usage.heapTotal),
      monitoring.recordMetric('memory.rss', usage.rss),
      monitoring.recordMetric('memory.external', usage.external)
    ]);
  },

  // Error metrics
  async recordError(category: string, error: Error) {
    await monitoring.recordMetric(`error.${category}`, 1, {
      message: error.message,
      stack: error.stack,
      timestamp: Date.now()
    });
  },

  // User metrics
  async recordUserActivity(userId: string, action: string, metadata: Record<string, any> = {}) {
    await monitoring.recordMetric(`user.activity.${action}`, 1, {
      userId,
      ...metadata,
      timestamp: Date.now()
    });
  },

  async recordUserSession(userId: string, durationMs: number) {
    await monitoring.recordMetric('user.session.duration', durationMs, {
      userId,
      timestamp: Date.now()
    });
  },

  // API metrics
  async recordApiCall(endpoint: string, method: string, statusCode: number, durationMs: number) {
    await monitoring.recordMetric('api.request', 1, {
      endpoint,
      method,
      statusCode,
      duration: durationMs,
      timestamp: Date.now()
    });
  },

  // Resource metrics
  async recordCpuUsage(percentage: number) {
    await monitoring.recordMetric('system.cpu', percentage);
  },

  async recordDiskUsage(path: string, usedBytes: number, totalBytes: number) {
    await monitoring.recordMetric(`system.disk.${path}`, usedBytes, {
      total: totalBytes,
      percentage: (usedBytes / totalBytes) * 100
    });
  },

  // Business metrics
  async recordConversion(type: string, value: number = 1) {
    await monitoring.recordMetric(`business.conversion.${type}`, value, {
      timestamp: Date.now()
    });
  },

  async recordRevenue(amount: number, currency: string, metadata: Record<string, any> = {}) {
    await monitoring.recordMetric('business.revenue', amount, {
      currency,
      ...metadata,
      timestamp: Date.now()
    });
  },

  // Custom metrics
  async recordCustomMetric(name: string, value: number, metadata: Record<string, any> = {}) {
    await monitoring.recordMetric(`custom.${name}`, value, {
      ...metadata,
      timestamp: Date.now()
    });
  },

  // Aggregated metrics
  async recordAggregatedMetrics(metrics: Array<{
    name: string;
    value: number;
    metadata?: Record<string, any>;
  }>) {
    await Promise.all(
      metrics.map(({ name, value, metadata = {} }) =>
        monitoring.recordMetric(name, value, {
          ...metadata,
          timestamp: Date.now()
        })
      )
    );
  }
};

// Auto-record system metrics every minute
setInterval(async () => {
  try {
    await metrics.recordMemoryUsage();
    // Add more periodic metrics here
  } catch (error) {
    console.error('Error recording system metrics:', error);
  }
}, 60000);
