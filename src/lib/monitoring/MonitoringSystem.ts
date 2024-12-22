import { MetricsClient } from '@opentelemetry/metrics';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

export class MonitoringSystem {
  private static instance: MonitoringSystem;
  private metricsClient: MetricsClient;
  private exporter: PrometheusExporter;

  private constructor() {
    this.exporter = new PrometheusExporter({
      port: 9464,
      endpoint: '/metrics'
    });

    const resource = new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: 'monkey-one',
      [SemanticResourceAttributes.SERVICE_VERSION]: '1.0.0'
    });

    this.metricsClient = new MetricsClient({
      resource,
      exporter: this.exporter
    });
  }

  static getInstance(): MonitoringSystem {
    if (!MonitoringSystem.instance) {
      MonitoringSystem.instance = new MonitoringSystem();
    }
    return MonitoringSystem.instance;
  }

  // Vector Store Metrics
  recordVectorOperation(operation: string, duration: number) {
    this.metricsClient.recordMetric({
      name: 'vector_store_operation',
      value: duration,
      attributes: { operation }
    });
  }

  // Firebase Metrics
  recordDatabaseOperation(operation: string, duration: number) {
    this.metricsClient.recordMetric({
      name: 'database_operation',
      value: duration,
      attributes: { operation }
    });
  }

  // Tool Creation Metrics
  recordToolCreation(success: boolean, duration: number) {
    this.metricsClient.recordMetric({
      name: 'tool_creation',
      value: duration,
      attributes: { success: success.toString() }
    });
  }

  // System Health Metrics
  recordMemoryUsage() {
    const used = process.memoryUsage();
    this.metricsClient.recordMetric({
      name: 'memory_usage',
      value: used.heapUsed / 1024 / 1024,
      attributes: { type: 'heap' }
    });
  }

  // Error Metrics
  recordError(component: string, errorType: string) {
    this.metricsClient.recordMetric({
      name: 'error_count',
      value: 1,
      attributes: { component, errorType }
    });
  }
}

export const monitoring = MonitoringSystem.getInstance();
