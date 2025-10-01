/**
 * Performance Monitoring System
 * 
 * Comprehensive monitoring and metrics collection for the memory graph system,
 * including performance tracking, health checks, and alerting.
 */

import type { MemoryGraph } from './memory-graph';

export interface PerformanceMetrics {
  // System metrics
  system: {
    uptime: number;
    memoryUsage: {
      used: number;
      total: number;
      percentage: number;
    };
    cpuUsage: number;
    timestamp: Date;
  };

  // Graph metrics
  graph: {
    nodeCount: number;
    edgeCount: number;
    avgDegree: number;
    density: number;
    lastUpdate: Date;
    growthRate: {
      nodes: number;
      edges: number;
      timeframe: string;
    };
  };

  // Operation metrics
  operations: {
    queries: OperationStats;
    ingestion: OperationStats;
    analysis: OperationStats;
    recommendations: OperationStats;
  };

  // Cache metrics
  cache: {
    hitRate: number;
    missRate: number;
    size: number;
    evictions: number;
  };

  // Error metrics
  errors: {
    total: number;
    rate: number;
    byType: Record<string, number>;
    recent: ErrorRecord[];
  };
}

export interface OperationStats {
  count: number;
  totalTime: number;
  avgTime: number;
  minTime: number;
  maxTime: number;
  successRate: number;
  errorRate: number;
  throughput: number; // operations per second
}

export interface ErrorRecord {
  timestamp: Date;
  type: string;
  message: string;
  stack?: string;
  context?: Record<string, any>;
}

export interface HealthCheck {
  name: string;
  status: 'healthy' | 'warning' | 'critical' | 'unknown';
  message: string;
  timestamp: Date;
  responseTime?: number;
  metadata?: Record<string, any>;
}

export interface Alert {
  id: string;
  type: 'performance' | 'error' | 'capacity' | 'health';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  timestamp: Date;
  resolved: boolean;
  resolvedAt?: Date;
  metadata: Record<string, any>;
}

export interface PerformanceThresholds {
  queryTime: { warning: number; critical: number };
  ingestionTime: { warning: number; critical: number };
  memoryUsage: { warning: number; critical: number };
  errorRate: { warning: number; critical: number };
  cacheHitRate: { warning: number; critical: number };
}

export class PerformanceMonitor {
  private graph: MemoryGraph;
  private metrics: PerformanceMetrics;
  private operationTimings: Map<string, number[]> = new Map();
  private errorLog: ErrorRecord[] = [];
  private alerts: Alert[] = [];
  private healthChecks: Map<string, HealthCheck> = new Map();
  private startTime: Date = new Date();
  private isMonitoring = false;
  private monitoringInterval?: NodeJS.Timeout;
  private thresholds: PerformanceThresholds;

  constructor(graph: MemoryGraph, thresholds?: Partial<PerformanceThresholds>) {
    this.graph = graph;
    this.thresholds = {
      queryTime: { warning: 1000, critical: 5000 },
      ingestionTime: { warning: 2000, critical: 10000 },
      memoryUsage: { warning: 80, critical: 95 },
      errorRate: { warning: 5, critical: 15 },
      cacheHitRate: { warning: 70, critical: 50 },
      ...thresholds
    };

    this.metrics = this.initializeMetrics();
    this.initializeHealthChecks();
  }

  // Start monitoring
  startMonitoring(intervalMs: number = 30000): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    this.monitoringInterval = setInterval(() => {
      this.collectMetrics();
      this.runHealthChecks();
      this.checkAlerts();
    }, intervalMs);

    console.log('Performance monitoring started');
  }

  // Stop monitoring
  stopMonitoring(): void {
    if (!this.isMonitoring) return;

    this.isMonitoring = false;
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
    }

    console.log('Performance monitoring stopped');
  }

  // Record operation timing
  recordOperation(type: keyof PerformanceMetrics['operations'], duration: number, success: boolean = true): void {
    const key = `${type}_${success ? 'success' : 'error'}`;
    
    if (!this.operationTimings.has(key)) {
      this.operationTimings.set(key, []);
    }
    
    const timings = this.operationTimings.get(key)!;
    timings.push(duration);
    
    // Keep only last 1000 measurements
    if (timings.length > 1000) {
      timings.shift();
    }

    // Update metrics
    this.updateOperationStats(type, duration, success);
  }

  // Record error
  recordError(type: string, message: string, stack?: string, context?: Record<string, any>): void {
    const error: ErrorRecord = {
      timestamp: new Date(),
      type,
      message,
      stack,
      context
    };

    this.errorLog.push(error);
    
    // Keep only last 1000 errors
    if (this.errorLog.length > 1000) {
      this.errorLog.shift();
    }

    // Update error metrics
    this.updateErrorMetrics();
    
    // Check if this should trigger an alert
    this.checkErrorAlert(error);
  }

  // Get current metrics
  getMetrics(): PerformanceMetrics {
    this.collectMetrics();
    return { ...this.metrics };
  }

  // Get health status
  getHealthStatus(): {
    overall: 'healthy' | 'warning' | 'critical' | 'unknown';
    checks: HealthCheck[];
    score: number;
  } {
    const checks = Array.from(this.healthChecks.values());
    const healthyCount = checks.filter(c => c.status === 'healthy').length;
    const warningCount = checks.filter(c => c.status === 'warning').length;
    const criticalCount = checks.filter(c => c.status === 'critical').length;

    let overall: 'healthy' | 'warning' | 'critical' | 'unknown' = 'healthy';
    if (criticalCount > 0) {
      overall = 'critical';
    } else if (warningCount > 0) {
      overall = 'warning';
    } else if (checks.length === 0) {
      overall = 'unknown';
    }

    const score = checks.length > 0 ? (healthyCount / checks.length) * 100 : 0;

    return { overall, checks, score };
  }

  // Get active alerts
  getAlerts(): Alert[] {
    return this.alerts.filter(alert => !alert.resolved);
  }

  // Get all alerts
  getAllAlerts(): Alert[] {
    return [...this.alerts];
  }

  // Resolve alert
  resolveAlert(alertId: string): void {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert && !alert.resolved) {
      alert.resolved = true;
      alert.resolvedAt = new Date();
    }
  }

  // Performance analysis
  getPerformanceAnalysis(): {
    bottlenecks: string[];
    recommendations: string[];
    trends: {
      performance: 'improving' | 'stable' | 'degrading';
      errors: 'decreasing' | 'stable' | 'increasing';
      capacity: 'low' | 'medium' | 'high';
    };
  } {
    const bottlenecks: string[] = [];
    const recommendations: string[] = [];

    // Analyze query performance
    if (this.metrics.operations.queries.avgTime > this.thresholds.queryTime.warning) {
      bottlenecks.push('Slow query performance');
      recommendations.push('Consider optimizing graph indexes or query patterns');
    }

    // Analyze memory usage
    if (this.metrics.system.memoryUsage.percentage > this.thresholds.memoryUsage.warning) {
      bottlenecks.push('High memory usage');
      recommendations.push('Consider implementing memory optimization or scaling');
    }

    // Analyze error rate
    if (this.metrics.errors.rate > this.thresholds.errorRate.warning) {
      bottlenecks.push('High error rate');
      recommendations.push('Investigate and fix recurring errors');
    }

    // Analyze cache performance
    if (this.metrics.cache.hitRate < this.thresholds.cacheHitRate.warning) {
      bottlenecks.push('Low cache hit rate');
      recommendations.push('Review caching strategy and cache size');
    }

    // Determine trends (simplified)
    const trends = {
      performance: 'stable' as const,
      errors: 'stable' as const,
      capacity: this.metrics.system.memoryUsage.percentage > 70 ? 'high' as const : 'medium' as const
    };

    return { bottlenecks, recommendations, trends };
  }

  // Private methods
  private initializeMetrics(): PerformanceMetrics {
    return {
      system: {
        uptime: 0,
        memoryUsage: { used: 0, total: 0, percentage: 0 },
        cpuUsage: 0,
        timestamp: new Date()
      },
      graph: {
        nodeCount: 0,
        edgeCount: 0,
        avgDegree: 0,
        density: 0,
        lastUpdate: new Date(),
        growthRate: { nodes: 0, edges: 0, timeframe: '24h' }
      },
      operations: {
        queries: this.createEmptyOperationStats(),
        ingestion: this.createEmptyOperationStats(),
        analysis: this.createEmptyOperationStats(),
        recommendations: this.createEmptyOperationStats()
      },
      cache: {
        hitRate: 0,
        missRate: 0,
        size: 0,
        evictions: 0
      },
      errors: {
        total: 0,
        rate: 0,
        byType: {},
        recent: []
      }
    };
  }

  private createEmptyOperationStats(): OperationStats {
    return {
      count: 0,
      totalTime: 0,
      avgTime: 0,
      minTime: 0,
      maxTime: 0,
      successRate: 100,
      errorRate: 0,
      throughput: 0
    };
  }

  private collectMetrics(): void {
    // Update system metrics
    this.updateSystemMetrics();
    
    // Update graph metrics
    this.updateGraphMetrics();
    
    // Update cache metrics (if cache is implemented)
    this.updateCacheMetrics();
    
    // Update error metrics
    this.updateErrorMetrics();
  }

  private updateSystemMetrics(): void {
    const now = new Date();
    this.metrics.system.uptime = now.getTime() - this.startTime.getTime();
    this.metrics.system.timestamp = now;

    // In a real implementation, these would get actual system metrics
    if (typeof process !== 'undefined' && process.memoryUsage) {
      const memUsage = process.memoryUsage();
      this.metrics.system.memoryUsage = {
        used: memUsage.heapUsed,
        total: memUsage.heapTotal,
        percentage: (memUsage.heapUsed / memUsage.heapTotal) * 100
      };
    }
  }

  private updateGraphMetrics(): void {
    const stats = this.graph.getStats();
    this.metrics.graph.nodeCount = stats.nodeCount;
    this.metrics.graph.edgeCount = stats.edgeCount;
    this.metrics.graph.avgDegree = stats.avgDegree;
    this.metrics.graph.lastUpdate = new Date();

    // Calculate density
    if (stats.nodeCount > 1) {
      const maxEdges = stats.nodeCount * (stats.nodeCount - 1);
      this.metrics.graph.density = (stats.edgeCount * 2) / maxEdges;
    }
  }

  private updateCacheMetrics(): void {
    // Placeholder for cache metrics
    // In a real implementation, this would get metrics from the cache system
    this.metrics.cache = {
      hitRate: 85, // Example value
      missRate: 15,
      size: 1000,
      evictions: 5
    };
  }

  private updateOperationStats(type: keyof PerformanceMetrics['operations'], duration: number, success: boolean): void {
    const stats = this.metrics.operations[type];
    
    stats.count++;
    stats.totalTime += duration;
    stats.avgTime = stats.totalTime / stats.count;
    
    if (stats.minTime === 0 || duration < stats.minTime) {
      stats.minTime = duration;
    }
    
    if (duration > stats.maxTime) {
      stats.maxTime = duration;
    }

    // Update success/error rates
    const successKey = `${type}_success`;
    const errorKey = `${type}_error`;
    const successCount = this.operationTimings.get(successKey)?.length || 0;
    const errorCount = this.operationTimings.get(errorKey)?.length || 0;
    const total = successCount + errorCount;
    
    if (total > 0) {
      stats.successRate = (successCount / total) * 100;
      stats.errorRate = (errorCount / total) * 100;
    }

    // Calculate throughput (operations per second over last minute)
    const oneMinuteAgo = Date.now() - 60000;
    const recentOperations = [
      ...(this.operationTimings.get(successKey) || []),
      ...(this.operationTimings.get(errorKey) || [])
    ].filter(time => time > oneMinuteAgo);
    
    stats.throughput = recentOperations.length / 60;
  }

  private updateErrorMetrics(): void {
    const now = Date.now();
    const oneHourAgo = now - 3600000;
    
    // Count recent errors
    const recentErrors = this.errorLog.filter(error => 
      error.timestamp.getTime() > oneHourAgo
    );
    
    this.metrics.errors.total = this.errorLog.length;
    this.metrics.errors.rate = recentErrors.length;
    this.metrics.errors.recent = this.errorLog.slice(-10);
    
    // Count by type
    this.metrics.errors.byType = {};
    recentErrors.forEach(error => {
      this.metrics.errors.byType[error.type] = 
        (this.metrics.errors.byType[error.type] || 0) + 1;
    });
  }

  private initializeHealthChecks(): void {
    // Graph connectivity check
    this.healthChecks.set('graph_connectivity', {
      name: 'Graph Connectivity',
      status: 'unknown',
      message: 'Not checked yet',
      timestamp: new Date()
    });

    // Memory usage check
    this.healthChecks.set('memory_usage', {
      name: 'Memory Usage',
      status: 'unknown',
      message: 'Not checked yet',
      timestamp: new Date()
    });

    // Error rate check
    this.healthChecks.set('error_rate', {
      name: 'Error Rate',
      status: 'unknown',
      message: 'Not checked yet',
      timestamp: new Date()
    });

    // Performance check
    this.healthChecks.set('performance', {
      name: 'Performance',
      status: 'unknown',
      message: 'Not checked yet',
      timestamp: new Date()
    });
  }

  private runHealthChecks(): void {
    const now = new Date();

    // Graph connectivity check
    const stats = this.graph.getStats();
    const connectivityCheck: HealthCheck = {
      name: 'Graph Connectivity',
      status: stats.nodeCount > 0 ? 'healthy' : 'warning',
      message: stats.nodeCount > 0 ? 
        `Graph has ${stats.nodeCount} nodes and ${stats.edgeCount} edges` :
        'Graph is empty',
      timestamp: now,
      metadata: { nodeCount: stats.nodeCount, edgeCount: stats.edgeCount }
    };
    this.healthChecks.set('graph_connectivity', connectivityCheck);

    // Memory usage check
    const memUsage = this.metrics.system.memoryUsage.percentage;
    const memoryCheck: HealthCheck = {
      name: 'Memory Usage',
      status: memUsage > this.thresholds.memoryUsage.critical ? 'critical' :
              memUsage > this.thresholds.memoryUsage.warning ? 'warning' : 'healthy',
      message: `Memory usage: ${memUsage.toFixed(1)}%`,
      timestamp: now,
      metadata: { percentage: memUsage }
    };
    this.healthChecks.set('memory_usage', memoryCheck);

    // Error rate check
    const errorRate = this.metrics.errors.rate;
    const errorCheck: HealthCheck = {
      name: 'Error Rate',
      status: errorRate > this.thresholds.errorRate.critical ? 'critical' :
              errorRate > this.thresholds.errorRate.warning ? 'warning' : 'healthy',
      message: `${errorRate} errors in the last hour`,
      timestamp: now,
      metadata: { errorRate }
    };
    this.healthChecks.set('error_rate', errorCheck);

    // Performance check
    const avgQueryTime = this.metrics.operations.queries.avgTime;
    const performanceCheck: HealthCheck = {
      name: 'Performance',
      status: avgQueryTime > this.thresholds.queryTime.critical ? 'critical' :
              avgQueryTime > this.thresholds.queryTime.warning ? 'warning' : 'healthy',
      message: `Average query time: ${avgQueryTime.toFixed(0)}ms`,
      timestamp: now,
      metadata: { avgQueryTime }
    };
    this.healthChecks.set('performance', performanceCheck);
  }

  private checkAlerts(): void {
    // Check for performance alerts
    if (this.metrics.operations.queries.avgTime > this.thresholds.queryTime.critical) {
      this.createAlert('performance', 'critical', 'Slow Query Performance', 
        `Average query time is ${this.metrics.operations.queries.avgTime.toFixed(0)}ms`);
    }

    // Check for memory alerts
    if (this.metrics.system.memoryUsage.percentage > this.thresholds.memoryUsage.critical) {
      this.createAlert('capacity', 'critical', 'High Memory Usage',
        `Memory usage is ${this.metrics.system.memoryUsage.percentage.toFixed(1)}%`);
    }

    // Check for error rate alerts
    if (this.metrics.errors.rate > this.thresholds.errorRate.critical) {
      this.createAlert('error', 'critical', 'High Error Rate',
        `${this.metrics.errors.rate} errors in the last hour`);
    }
  }

  private checkErrorAlert(error: ErrorRecord): void {
    // Create alert for critical errors
    if (error.type === 'critical' || error.message.toLowerCase().includes('critical')) {
      this.createAlert('error', 'high', 'Critical Error Occurred', error.message);
    }
  }

  private createAlert(type: Alert['type'], severity: Alert['severity'], title: string, description: string): void {
    // Check if similar alert already exists
    const existingAlert = this.alerts.find(alert => 
      !alert.resolved && alert.title === title && alert.type === type
    );

    if (existingAlert) return; // Don't create duplicate alerts

    const alert: Alert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      severity,
      title,
      description,
      timestamp: new Date(),
      resolved: false,
      metadata: {}
    };

    this.alerts.push(alert);
    console.warn(`Alert created: ${title} - ${description}`);
  }

  // Cleanup
  cleanup(): void {
    this.stopMonitoring();
    this.operationTimings.clear();
    this.errorLog = [];
    this.alerts = [];
    this.healthChecks.clear();
  }
}

// Helper function to create a performance monitor
export function createPerformanceMonitor(
  graph: MemoryGraph, 
  thresholds?: Partial<PerformanceThresholds>
): PerformanceMonitor {
  return new PerformanceMonitor(graph, thresholds);
}

// Decorator for timing operations
export function timed(monitor: PerformanceMonitor, operationType: keyof PerformanceMetrics['operations']) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const startTime = Date.now();
      let success = true;

      try {
        const result = await method.apply(this, args);
        return result;
      } catch (error) {
        success = false;
        monitor.recordError('operation_error', error instanceof Error ? error.message : 'Unknown error');
        throw error;
      } finally {
        const duration = Date.now() - startTime;
        monitor.recordOperation(operationType, duration, success);
      }
    };

    return descriptor;
  };
}