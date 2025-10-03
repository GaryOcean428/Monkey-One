import { logger } from '../../utils/logger'

interface RequestMetrics {
  success: boolean
  latency?: number
  tokenUsage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
  error?: Error
  streaming?: boolean
}

export interface AnalyticsEvent {
  eventName: string
  timestamp: number
  data: Record<string, any>
}

export interface ModelMetrics {
  totalRequests: number
  totalTokens: number
  averageLatency: number
  errorRate: number
  cacheHitRate: number
}

class Analytics {
  private static instance: Analytics
  private events: AnalyticsEvent[] = []
  private metrics: Map<string, any> = new Map()
  private flushInterval: number = 60000 // 1 minute

  private constructor() {
    this.setupPeriodicFlush()
  }

  static getInstance(): Analytics {
    if (!Analytics.instance) {
      Analytics.instance = new Analytics()
    }
    return Analytics.instance
  }

  private setupPeriodicFlush() {
    setInterval(() => {
      this.flush()
    }, this.flushInterval)
  }

  trackEvent(eventName: string, data: Record<string, any>) {
    const event: AnalyticsEvent = {
      eventName,
      timestamp: Date.now(),
      data,
    }

    this.events.push(event)
    this.updateMetrics(event)
    logger.debug(`Analytics event tracked: ${eventName}`, data)
  }

  private updateMetrics(event: AnalyticsEvent) {
    const { modelName } = event.data
    if (!modelName) return

    const currentMetrics = this.metrics.get(modelName) || {
      totalRequests: 0,
      totalTokens: 0,
      averageLatency: 0,
      errorRate: 0,
      cacheHitRate: 0,
    }

    // Update metrics based on event type
    switch (event.eventName) {
      case 'modelRequest':
        currentMetrics.totalRequests++
        if (event.data.tokens) {
          currentMetrics.totalTokens += event.data.tokens
        }
        if (event.data.latency) {
          const newAvg =
            (currentMetrics.averageLatency * (currentMetrics.totalRequests - 1) +
              event.data.latency) /
            currentMetrics.totalRequests
          currentMetrics.averageLatency = newAvg
        }
        break

      case 'modelError':
        currentMetrics.errorRate =
          (currentMetrics.errorRate * (currentMetrics.totalRequests - 1) + 1) /
          currentMetrics.totalRequests
        break

      case 'cacheHit':
        currentMetrics.cacheHitRate =
          (currentMetrics.cacheHitRate * (currentMetrics.totalRequests - 1) + 1) /
          currentMetrics.totalRequests
        break
    }

    this.metrics.set(modelName, currentMetrics)
  }

  getMetrics(modelName?: string): ModelMetrics | Map<string, ModelMetrics> {
    if (modelName) {
      return (
        this.metrics.get(modelName) || {
          totalRequests: 0,
          totalTokens: 0,
          averageLatency: 0,
          errorRate: 0,
          cacheHitRate: 0,
        }
      )
    }
    return this.metrics
  }

  private async flush() {
    if (this.events.length === 0) return

    try {
      // Here you would typically send the events to your analytics service
      // For now, we'll just log them
      logger.info(`Flushing ${this.events.length} analytics events`)

      // Clear the events array
      this.events = []
    } catch (error) {
      logger.error('Error flushing analytics events:', error)
    }
  }

  recordRequest(modelName: string, metrics: RequestMetrics) {
    try {
      const modelMetrics = this.metrics.get(modelName) || {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        totalLatency: 0,
        tokenUsage: {
          prompt: 0,
          completion: 0,
          total: 0,
        },
      }

      modelMetrics.totalRequests++

      if (metrics.success) {
        modelMetrics.successfulRequests++
        if (metrics.latency) {
          modelMetrics.totalLatency += metrics.latency
          modelMetrics.averageLatency = modelMetrics.totalLatency / modelMetrics.successfulRequests
        }
        if (metrics.tokenUsage) {
          modelMetrics.tokenUsage.prompt += metrics.tokenUsage.promptTokens
          modelMetrics.tokenUsage.completion += metrics.tokenUsage.completionTokens
          modelMetrics.tokenUsage.total += metrics.tokenUsage.totalTokens
        }
      } else {
        modelMetrics.failedRequests++
      }

      modelMetrics.errorRate = modelMetrics.failedRequests / modelMetrics.totalRequests
      modelMetrics.lastUpdated = new Date()

      this.metrics.set(modelName, modelMetrics)
    } catch (error) {
      logger.error('Error recording analytics:', error)
    }
  }

  getRecordedMetrics(modelName?: string) {
    if (modelName) {
      return (
        this.metrics.get(modelName) || {
          totalRequests: 0,
          errorRate: 0,
          cacheHitRate: 0,
          averageLatency: 0,
          tokenUsage: { prompt: 0, completion: 0, total: 0 },
          lastUpdated: new Date(),
        }
      )
    }
    return this.metrics
  }
}

export const analytics = Analytics.getInstance()
