import { logger } from './logger'

interface Metric {
  name: string
  value: number
  tags?: Record<string, string>
}

class Monitoring {
  private metrics: Metric[] = []

  public recordMetric(name: string, value: number, tags?: Record<string, string>) {
    this.metrics.push({
      name,
      value,
      tags,
    })
    logger.debug('Recorded metric', { name, value, tags })
  }

  public getMetrics(): Metric[] {
    return this.metrics
  }

  public clearMetrics(): void {
    this.metrics = []
  }
}

export const monitoring = new Monitoring()
