import { getPerformance } from 'firebase/performance';
import { monitoring } from '../monitoring/MonitoringSystem';
import { retry } from '../utils/retry';

export class FirebasePerformance {
  private static instance: FirebasePerformance;
  private performance = getPerformance();
  private traces: Map<string, any> = new Map();

  private constructor() {
    // Start collecting metrics
    setInterval(() => this.collectMetrics(), 60000);
  }

  static getInstance(): FirebasePerformance {
    if (!FirebasePerformance.instance) {
      FirebasePerformance.instance = new FirebasePerformance();
    }
    return FirebasePerformance.instance;
  }

  async startTrace(operationName: string): Promise<string> {
    const trace = await this.performance.trace(operationName);
    await trace.start();
    const traceId = crypto.randomUUID();
    this.traces.set(traceId, trace);
    return traceId;
  }

  async stopTrace(traceId: string, success: boolean = true) {
    const trace = this.traces.get(traceId);
    if (trace) {
      trace.putMetric('success', success ? 1 : 0);
      await trace.stop();
      this.traces.delete(traceId);
    }
  }

  private async collectMetrics() {
    try {
      const metrics = await this.performance.getMetrics();
      
      // Record operation latencies
      for (const [operation, latency] of Object.entries(metrics.operationLatencies)) {
        monitoring.recordMetric('firebase_operation_latency', latency, { operation });
      }

      // Record error rates
      for (const [operation, errorRate] of Object.entries(metrics.operationErrorRates)) {
        monitoring.recordMetric('firebase_error_rate', errorRate, { operation });
      }

      // Record cache hit rates
      for (const [operation, hitRate] of Object.entries(metrics.cacheHitRates)) {
        monitoring.recordMetric('firebase_cache_hit_rate', hitRate, { operation });
      }
    } catch (error) {
      console.error('Failed to collect Firebase metrics:', error);
    }
  }

  // Wrapper for database operations with automatic performance tracking
  async trackOperation<T>(
    operationName: string,
    operation: () => Promise<T>,
    options: {
      retries?: number;
      timeout?: number;
    } = {}
  ): Promise<T> {
    const traceId = await this.startTrace(operationName);
    const startTime = Date.now();

    try {
      const result = await retry(
        async () => {
          const timeoutPromise = options.timeout
            ? new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Operation timed out')), options.timeout)
              )
            : null;

          const operationPromise = operation();

          return timeoutPromise
            ? Promise.race([operationPromise, timeoutPromise])
            : operationPromise;
        },
        options.retries || 3
      );

      const duration = Date.now() - startTime;
      monitoring.recordDatabaseOperation(operationName, duration);
      await this.stopTrace(traceId, true);
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      monitoring.recordDatabaseOperation(operationName, duration);
      monitoring.recordError('firebase', `${operationName}_failed`);
      await this.stopTrace(traceId, false);
      throw error;
    }
  }
}

export const firebasePerformance = FirebasePerformance.getInstance();
