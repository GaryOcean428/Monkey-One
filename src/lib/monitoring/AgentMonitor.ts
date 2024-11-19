import type { Message, AgentMetrics } from '../../types';

export class AgentMonitor {
  private active: boolean = true;
  private metrics: AgentMetrics = {
    operationDuration: {},
    errorCount: 0,
    successCount: 0,
    avgProcessingTime: 0,
    operations: []
  };
  private operationStartTimes: Map<string, number> = new Map();
  private customMetrics: Map<string, number> = new Map();

  trackMessage(): void {
    // ...logging logic...
  }

  getAgentMetrics(agentId: string): AgentMetrics {
    // ...metrics retrieval...
    return {} as AgentMetrics;
  }

  endOperation(name: string, metrics?: Record<string, unknown>): void {
    if (!this.active) return;

    const startTime = this.operationStartTimes.get(name);
    if (!startTime) return;

    const duration = Date.now() - startTime;
    this.operationStartTimes.delete(name);

    // Update operation metrics
    let operation = this.metrics.operations.find(op => op.name === name);
    if (!operation) {
      operation = {
        name,
        count: 0,
        avgDuration: 0,
        lastDuration: 0
      };
      this.metrics.operations.push(operation);
    }

    operation.count++;
    operation.lastDuration = duration;
    operation.avgDuration = 
      (operation.avgDuration * (operation.count - 1) + duration) / operation.count;

    // Update overall metrics
    this.metrics.operationDuration[name] = 
      (this.metrics.operationDuration[name] || 0) + duration;
    this.metrics.successCount++;
    this.updateAverageProcessingTime(duration);

    // Store additional metrics if provided
    if (metrics) {
      Object.entries(metrics).forEach(([key, value]) => {
        if (typeof value === 'number') {
          this.addMetric(`${name}.${key}`, value);
        }
      });
    }
  }

  logError(error: Error): void {
    if (!this.active) return;

    this.metrics.errorCount++;
    this.metrics.lastError = error;
  }

  getMetrics(): Record<string, unknown> {
    const customMetricsObj: Record<string, number> = {};
    this.customMetrics.forEach((value, key) => {
      customMetricsObj[key] = value;
    });

    return {
      ...this.metrics,
      customMetrics: customMetricsObj,
      activeOperations: Array.from(this.operationStartTimes.keys()),
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      resourceUtilization: {
        cpuUsage: process.cpuUsage(),
        activeOperationsCount: this.operationStartTimes.size,
        totalOperations: this.metrics.successCount + this.metrics.errorCount
      }
    };
  }

  shutdown(): void {
    this.active = false;
    this.operationStartTimes.clear();
  }

  reset(): void {
    this.metrics = {
      operationDuration: {},
      errorCount: 0,
      successCount: 0,
      avgProcessingTime: 0,
      operations: []
    };
    this.operationStartTimes.clear();
    this.customMetrics.clear();
  }

  addMetric(name: string, value: number): void {
    if (!this.active) return;
    this.customMetrics.set(name, value);
  }

  getOperationMetrics(name: string): Record<string, unknown> {
    const operation = this.metrics.operations.find(op => op.name === name);
    if (!operation) {

    return {
      count: operation.count,
      avgDuration: operation.avgDuration,
      lastDuration: operation.lastDuration,
      totalDuration: this.metrics.operationDuration[name] || 0,
      successRate: this.calculateSuccessRate(name),
      throughput: this.calculateThroughput(name)
    };
  }

  clearMetrics(): void {
    this.reset();
  }

  private updateAverageProcessingTime(duration: number): void {
    const totalOperations = this.metrics.successCount + this.metrics.errorCount;
    const oldAvg = this.metrics.avgProcessingTime;
    
    this.metrics.avgProcessingTime = 
      (oldAvg * (totalOperations - 1) + duration) / totalOperations;
  }

  private calculateSuccessRate(operationName: string): number {
    const operation = this.metrics.operations.find(op => op.name === operationName);
    if (!operation) return 0;

    const totalAttempts = operation.count;
    const errorCount = this.metrics.operations
      .filter(op => op.name.startsWith(`${operationName}.error`))
      .reduce((sum, op) => sum + op.count, 0);

    return totalAttempts > 0 ? (totalAttempts - errorCount) / totalAttempts : 0;
  }

  private calculateThroughput(operationName: string): number {
    const operation = this.metrics.operations.find(op => op.name === operationName);
    if (!operation || operation.count === 0) return 0;

    const totalDuration = this.metrics.operationDuration[operationName] || 0;
    return totalDuration > 0 ? (operation.count * 1000) / totalDuration : 0;
  }
}
