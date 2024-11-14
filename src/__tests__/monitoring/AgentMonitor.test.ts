import { AgentMonitor } from '../../lib/monitoring/AgentMonitor';
import { MonitoringMetrics } from '../../types';

describe('AgentMonitor', () => {
  let monitor: AgentMonitor;

  beforeEach(() => {
    monitor = new AgentMonitor();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('operation tracking', () => {
    it('should track operation duration', () => {
      monitor.startOperation('test');
      jest.advanceTimersByTime(100);
      monitor.endOperation('test');

      const metrics = monitor.getOperationMetrics('test') as Record<string, number>;
      expect(metrics.lastDuration).toBeGreaterThanOrEqual(100);
      expect(metrics.count).toBe(1);
    });

    it('should calculate average duration correctly', () => {
      // First operation
      monitor.startOperation('test');
      jest.advanceTimersByTime(100);
      monitor.endOperation('test');

      // Second operation
      monitor.startOperation('test');
      jest.advanceTimersByTime(200);
      monitor.endOperation('test');

      const metrics = monitor.getOperationMetrics('test') as Record<string, number>;
      expect(metrics.avgDuration).toBe(150); // (100 + 200) / 2
      expect(metrics.count).toBe(2);
    });

    it('should ignore end operation without start', () => {
      monitor.endOperation('nonexistent');
      const metrics = monitor.getOperationMetrics('nonexistent');
      expect(metrics).toEqual({});
    });

    it('should track multiple operations independently', () => {
      monitor.startOperation('op1');
      monitor.startOperation('op2');
      jest.advanceTimersByTime(100);
      monitor.endOperation('op1');
      jest.advanceTimersByTime(100);
      monitor.endOperation('op2');

      const metrics = monitor.getMetrics() as unknown as MonitoringMetrics;
      expect(metrics.operations).toHaveLength(2);
      
      const op1Metrics = monitor.getOperationMetrics('op1') as Record<string, number>;
      const op2Metrics = monitor.getOperationMetrics('op2') as Record<string, number>;
      expect(op1Metrics.lastDuration).toBeLessThan(op2Metrics.lastDuration);
    });
  });

  describe('error handling', () => {
    it('should track error count', () => {
      monitor.logError(new Error('test error'));
      const metrics = monitor.getMetrics() as unknown as MonitoringMetrics;
      expect(metrics.errorCount).toBe(1);
    });

    it('should store last error', () => {
      const error1 = new Error('first error');
      const error2 = new Error('second error');
      
      monitor.logError(error1);
      monitor.logError(error2);
      
      const metrics = monitor.getMetrics() as unknown as MonitoringMetrics;
      expect(metrics.lastError).toBe(error2);
      expect(metrics.errorCount).toBe(2);
    });

    it('should not track errors when inactive', () => {
      monitor.shutdown();
      monitor.logError(new Error('test error'));
      const metrics = monitor.getMetrics() as unknown as MonitoringMetrics;
      expect(metrics.errorCount).toBe(0);
    });
  });

  describe('custom metrics', () => {
    it('should store and retrieve custom metrics', () => {
      monitor.addMetric('customMetric', 42);
      const metrics = monitor.getMetrics() as Record<string, unknown>;
      expect((metrics.customMetrics as Record<string, number>).customMetric).toBe(42);
    });

    it('should update existing custom metrics', () => {
      monitor.addMetric('metric', 1);
      monitor.addMetric('metric', 2);
      const metrics = monitor.getMetrics() as Record<string, unknown>;
      expect((metrics.customMetrics as Record<string, number>).metric).toBe(2);
    });

    it('should handle multiple custom metrics', () => {
      monitor.addMetric('metric1', 1);
      monitor.addMetric('metric2', 2);
      const metrics = monitor.getMetrics() as Record<string, unknown>;
      expect(metrics.customMetrics).toEqual({
        metric1: 1,
        metric2: 2
      });
    });
  });

  describe('lifecycle management', () => {
    it('should stop tracking after shutdown', () => {
      monitor.startOperation('test');
      monitor.shutdown();
      monitor.endOperation('test');
      
      const metrics = monitor.getMetrics() as unknown as MonitoringMetrics;
      expect(metrics.operations).toHaveLength(0);
      expect(metrics.successCount).toBe(0);
    });

    it('should clear all metrics on reset', () => {
      // Add various metrics
      monitor.startOperation('test');
      monitor.endOperation('test');
      monitor.logError(new Error('test'));
      monitor.addMetric('custom', 1);

      // Reset
      monitor.reset();
      
      const metrics = monitor.getMetrics() as unknown as MonitoringMetrics;
      expect(metrics.operations).toHaveLength(0);
      expect(metrics.errorCount).toBe(0);
      expect((metrics as unknown as Record<string, unknown>).customMetrics).toEqual({});
      expect(metrics.successCount).toBe(0);
    });

    it('should maintain active state after reset', () => {
      monitor.reset();
      monitor.startOperation('test');
      monitor.endOperation('test');
      
      const metrics = monitor.getMetrics() as unknown as MonitoringMetrics;
      expect(metrics.operations).toHaveLength(1);
    });
  });

  describe('performance metrics', () => {
    it('should calculate success rate correctly', () => {
      // Successful operation
      monitor.startOperation('test');
      monitor.endOperation('test');

      // Error operation
      monitor.startOperation('test.error');
      monitor.endOperation('test.error');

      const metrics = monitor.getOperationMetrics('test') as Record<string, number>;
      expect(metrics.successRate).toBe(0.5);
    });

    it('should calculate throughput', () => {
      // Perform 10 operations over 1 second
      for (let i = 0; i < 10; i++) {
        monitor.startOperation('test');
        jest.advanceTimersByTime(100);
        monitor.endOperation('test');
      }

      const metrics = monitor.getOperationMetrics('test') as Record<string, number>;
      expect(metrics.throughput).toBe(10); // 10 operations per second
    });

    it('should handle zero duration operations', () => {
      monitor.startOperation('test');
      monitor.endOperation('test');
      
      const metrics = monitor.getOperationMetrics('test') as Record<string, number>;
      expect(metrics.throughput).toBeDefined();
      expect(Number.isFinite(metrics.throughput)).toBe(true);
    });
  });

  describe('resource utilization', () => {
    it('should include system metrics', () => {
      const metrics = monitor.getMetrics() as Record<string, unknown>;
      expect(metrics.memoryUsage).toBeDefined();
      expect(metrics.resourceUtilization).toBeDefined();
      expect(metrics.uptime).toBeDefined();
    });

    it('should track active operations', () => {
      monitor.startOperation('test1');
      monitor.startOperation('test2');
      
      const metrics = monitor.getMetrics() as Record<string, unknown>;
      expect((metrics.activeOperations as string[]).includes('test1')).toBe(true);
      expect((metrics.activeOperations as string[]).includes('test2')).toBe(true);
      expect((metrics.resourceUtilization as Record<string, number>).activeOperationsCount).toBe(2);
    });

    it('should clear active operations on shutdown', () => {
      monitor.startOperation('test');
      monitor.shutdown();
      
      const metrics = monitor.getMetrics() as Record<string, unknown>;
      expect((metrics.activeOperations as string[]).length).toBe(0);
    });
  });
});
