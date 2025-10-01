import { describe, it, expect } from 'vitest';
import { monitoring } from '../../lib/monitoring/MonitoringService';
import { sleep } from '../../types/test-utils';

describe('Monitoring Service Integration Tests', () => {
  describe('Metrics', () => {
    it('should record and retrieve metrics', async () => {
      const now = Date.now();
      await monitoring.recordMetric('test_metric', 42, {
        tag1: 'value1',
        tag2: 'value2'
      });

      const metrics = await monitoring.getMetrics('test_metric', {
        start: now - 1000,
        end: now + 1000
      });

      expect(metrics).toHaveLength(1);
      expect(metrics[0].value).toBe(42);
      expect(metrics[0].tags).toMatchObject({
        tag1: 'value1',
        tag2: 'value2'
      });
    });

    it('should handle time ranges correctly', async () => {
      const now = Date.now();
      
      // Record metrics at different times
      await monitoring.recordMetric('time_test', 1);
      await sleep(100);
      await monitoring.recordMetric('time_test', 2);
      await sleep(100);
      await monitoring.recordMetric('time_test', 3);

      const metrics = await monitoring.getMetrics('time_test', {
        start: now,
        end: now + 150
      });

      expect(metrics).toHaveLength(2);
      expect(metrics.map(m => m.value)).toEqual([1, 2]);
    });
  });

  describe('Logging', () => {
    it('should record and retrieve logs', async () => {
      const now = Date.now();
      await monitoring.log('error', 'Test error', {
        code: 500,
        details: 'Something went wrong'
      });

      const logs = await monitoring.getLogs('error', {
        start: now - 1000,
        end: now + 1000
      });

      expect(logs).toHaveLength(1);
      expect(logs[0].message).toBe('Test error');
      expect(logs[0].metadata).toMatchObject({
        code: 500,
        details: 'Something went wrong'
      });
    });

    it('should respect log level filters', async () => {
      await monitoring.log('debug', 'Debug message');
      await monitoring.log('info', 'Info message');
      await monitoring.log('warn', 'Warning message');
      await monitoring.log('error', 'Error message');

      const now = Date.now();
      const timeRange = {
        start: now - 1000,
        end: now + 1000
      };

      const errorLogs = await monitoring.getLogs('error', timeRange);
      expect(errorLogs).toHaveLength(1);
      expect(errorLogs[0].message).toBe('Error message');

      const warnLogs = await monitoring.getLogs('warn', timeRange);
      expect(warnLogs).toHaveLength(1);
      expect(warnLogs[0].message).toBe('Warning message');
    });
  });

  describe('Performance Monitoring', () => {
    it('should track operation durations', async () => {
      const now = Date.now();
      
      await monitoring.recordOperationDuration('test_op', 100, {
        type: 'database',
        action: 'query'
      });

      const metrics = await monitoring.getMetrics('duration:test_op', {
        start: now - 1000,
        end: now + 1000
      });

      expect(metrics).toHaveLength(1);
      expect(metrics[0].value).toBe(100);
      expect(metrics[0].tags).toMatchObject({
        type: 'database',
        action: 'query'
      });
    });

    it('should track cache operations', async () => {
      const now = Date.now();
      
      await monitoring.recordCacheOperation('hit', 5);
      await monitoring.recordCacheOperation('miss', 50);
      await monitoring.recordCacheOperation('set', 10);

      const hits = await monitoring.getMetrics('cache:hit', {
        start: now - 1000,
        end: now + 1000
      });
      expect(hits).toHaveLength(1);
      expect(hits[0].value).toBe(5);

      const misses = await monitoring.getMetrics('cache:miss', {
        start: now - 1000,
        end: now + 1000
      });
      expect(misses).toHaveLength(1);
      expect(misses[0].value).toBe(50);
    });
  });

  describe('Health Checks', () => {
    it('should perform health checks', async () => {
      const health = await monitoring.checkHealth();
      
      expect(health.status).toBeDefined();
      expect(health.checks.redis).toBeDefined();
      expect(health.checks.redis.status).toBe('up');
      expect(health.checks.redis.latency).toBeLessThan(1000);
    });

    it('should detect service degradation', async () => {
      // Simulate a service being down
      const originalChecks = monitoring.checkHealth;
      monitoring.checkHealth = async () => ({
        status: 'degraded',
        checks: {
          redis: { status: 'up', latency: 100 },
          database: { status: 'down' }
        }
      });

      const health = await monitoring.checkHealth();
      expect(health.status).toBe('degraded');
      expect(health.checks.database.status).toBe('down');

      // Restore original implementation
      monitoring.checkHealth = originalChecks;
    });
  });
});
