import { getRedisClient } from '../redis/config';

export class MonitoringService {
  private static instance: MonitoringService;
  private readonly metricsPrefix = 'metrics:';
  private readonly logsPrefix = 'logs:';
  private readonly retentionDays = 7;

  private constructor() {}

  public static getInstance(): MonitoringService {
    if (!MonitoringService.instance) {
      MonitoringService.instance = new MonitoringService();
    }
    return MonitoringService.instance;
  }

  // Metrics
  async recordMetric(name: string, value: number, tags: Record<string, string> = {}): Promise<void> {
    const redis = await getRedisClient();
    const timestamp = Date.now();
    const key = `${this.metricsPrefix}${name}:${timestamp}`;
    
    await redis.hSet(key, {
      value: value.toString(),
      timestamp: timestamp.toString(),
      ...tags,
    });

    // Set expiry
    await redis.expire(key, this.retentionDays * 24 * 60 * 60);
  }

  async getMetrics(name: string, timeRange: { start: number; end: number }): Promise<Array<{
    value: number;
    timestamp: number;
    tags: Record<string, string>;
  }>> {
    const redis = await getRedisClient();
    const pattern = `${this.metricsPrefix}${name}:*`;
    const keys = await redis.keys(pattern);

    const metrics: Array<{
      value: number;
      timestamp: number;
      tags: Record<string, string>;
    }> = [];

    for (const key of keys) {
      const data = await redis.hGetAll(key);
      const timestamp = parseInt(data.timestamp);
      
      if (timestamp >= timeRange.start && timestamp <= timeRange.end) {
        const { value, timestamp: ts, ...tags } = data;
        metrics.push({
          value: parseFloat(value),
          timestamp: parseInt(ts),
          tags,
        });
      }
    }

    return metrics.sort((a, b) => a.timestamp - b.timestamp);
  }

  // Logging
  async log(level: 'debug' | 'info' | 'warn' | 'error', message: string, metadata: Record<string, any> = {}): Promise<void> {
    const redis = await getRedisClient();
    const timestamp = Date.now();
    const key = `${this.logsPrefix}${level}:${timestamp}`;

    await redis.hSet(key, {
      message,
      timestamp: timestamp.toString(),
      metadata: JSON.stringify(metadata),
    });

    // Set expiry
    await redis.expire(key, this.retentionDays * 24 * 60 * 60);
  }

  async getLogs(
    level: 'debug' | 'info' | 'warn' | 'error',
    timeRange: { start: number; end: number },
    limit: number = 100
  ): Promise<Array<{
    message: string;
    timestamp: number;
    metadata: Record<string, any>;
  }>> {
    const redis = await getRedisClient();
    const pattern = `${this.logsPrefix}${level}:*`;
    const keys = await redis.keys(pattern);

    const logs: Array<{
      message: string;
      timestamp: number;
      metadata: Record<string, any>;
    }> = [];

    for (const key of keys) {
      const data = await redis.hGetAll(key);
      const timestamp = parseInt(data.timestamp);
      
      if (timestamp >= timeRange.start && timestamp <= timeRange.end) {
        logs.push({
          message: data.message,
          timestamp,
          metadata: JSON.parse(data.metadata),
        });
      }
    }

    return logs
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  // Performance monitoring
  async recordOperationDuration(operation: string, durationMs: number, metadata: Record<string, any> = {}): Promise<void> {
    await this.recordMetric(`duration:${operation}`, durationMs, metadata);
  }

  async recordCacheOperation(operation: 'hit' | 'miss' | 'set', durationMs: number): Promise<void> {
    await this.recordMetric(`cache:${operation}`, durationMs);
  }

  async recordDatabaseOperation(operation: string, durationMs: number): Promise<void> {
    await this.recordMetric(`database:${operation}`, durationMs);
  }

  async recordError(source: string, error: Error): Promise<void> {
    await this.log('error', error.message, {
      source,
      stack: error.stack,
    });
  }

  // Health checks
  async checkHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    checks: Record<string, {
      status: 'up' | 'down';
      latency?: number;
    }>;
  }> {
    const checks: Record<string, {
      status: 'up' | 'down';
      latency?: number;
    }> = {};

    // Check Redis
    try {
      const redis = await getRedisClient();
      const start = Date.now();
      await redis.ping();
      checks.redis = {
        status: 'up',
        latency: Date.now() - start,
      };
    } catch (error) {
      checks.redis = { status: 'down' };
    }

    // Determine overall status
    const statuses = Object.values(checks).map(c => c.status);
    const status = statuses.every(s => s === 'up')
      ? 'healthy'
      : statuses.some(s => s === 'up')
      ? 'degraded'
      : 'unhealthy';

    return { status, checks };
  }
}

export const monitoring = MonitoringService.getInstance();
