/// <reference lib="dom" />
/// <reference lib="dom.iterable" />

import { logger } from '../../utils/logger'
import { ModelPerformanceTracker, ModelProvider, TaskType } from '../llm/ModelPerformanceTracker'

// Re-export ModelResponse type for external use
export interface ModelResponse {
  content: string
  model: string
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

interface ModelClientConfig {
  defaultProvider?: ModelProvider
  fallbackProviders?: ModelProvider[]
  maxRetries?: number
  routingPreferences?: {
    [key in TaskType]?: ModelProvider[]
  }
  maxLatency?: number // Maximum acceptable latency in ms
  adaptiveRouting?: boolean // Whether to use performance-based routing
}

interface APIResponse<T> {
  success: boolean
  data: T
  error?: string
}

export class ModelClient {
  private performanceTracker: ModelPerformanceTracker
  private currentProvider: ModelProvider
  private readonly fallbackProviders: ModelProvider[]
  private maxRetries: number
  private readonly maxLatency?: number
  private adaptiveRouting: boolean
  private routingPreferences: {
    [key in TaskType]?: ModelProvider[]
  }

  constructor(config: ModelClientConfig = {}) {
    this.performanceTracker = ModelPerformanceTracker.getInstance()
    this.currentProvider = config.defaultProvider || 'phi'
    this.fallbackProviders = config.fallbackProviders || ['o1-mini', 'claude-haiku']
    this.maxRetries = config.maxRetries || 3
    this.maxLatency = config.maxLatency
    this.adaptiveRouting = config.adaptiveRouting || false
    this.routingPreferences = config.routingPreferences || {}
  }

  private async handleResponse<T>(response: globalThis.Response): Promise<APIResponse<T>> {
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }
    const data = (await response.json()) as T
    return {
      success: true,
      data,
    }
  }

  private async generateWithProvider(
    provider: ModelProvider,
    prompt: string
  ): Promise<ModelResponse> {
    try {
      if (provider === 'phi') {
        // For local phi model, we'll use a simple REST endpoint
        const response = await globalThis.fetch('http://localhost:8000/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ prompt }),
        })
        const result = await this.handleResponse<ModelResponse>(response)
        return result.data
      }

      const endpoint = this.getEndpointForProvider(provider)
      const response = await globalThis.fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      })

      const result = await this.handleResponse<ModelResponse>(response)
      if (!result.success || !result.data) {
        throw new Error('Failed to generate response')
      }

      return result.data
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Generation failed with provider ${provider}: ${error.message}`)
      }
      throw new Error(`Generation failed with provider ${provider}`)
    }
  }

  private getEndpointForProvider(provider: ModelProvider): string {
    const endpoints: Record<ModelProvider, string> = {
      phi: 'http://localhost:8000/generate',
      o1: 'https://api.o1.ai/v1/generate',
      'o1-mini': 'https://api.o1.ai/v1/generate/mini',
      claude: 'https://api.anthropic.com/v1/complete',
      'claude-haiku': 'https://api.anthropic.com/v1/complete/haiku',
      grok: 'https://api.grok.ai/v1/chat/completions',
      'grok-40': 'https://api.grok.ai/v1/chat/completions/mini',
      perplexity: 'https://api.perplexity.ai/v1/complete',
      llama: 'https://api.llama.ai/v1/chat/completions',
      groq: 'https://api.groq.ai/v1/completions',
      qwen: 'https://api.qwen.ai/v1/completions',
    }
    return endpoints[provider]
  }

  public async generate(prompt: string, taskType?: TaskType): Promise<ModelResponse> {
    let attempts = 0
    let lastError: Error | null = null
    const startTime = Date.now()

    while (attempts < this.maxRetries) {
      try {
        const provider = this.selectProvider(taskType)
        const response = await this.generateWithProvider(provider, prompt)
        const latency = Date.now() - startTime

        // Record success metrics
        this.performanceTracker.recordLatency(provider, latency)
        if (response.usage) {
          this.performanceTracker.recordSuccess(provider, response.usage.total_tokens, 0) // Cost tracking TBD
        }
        if (taskType) {
          this.performanceTracker.recordQualityScore(provider, taskType, 8) // Default quality score for now
        }

        return response
      } catch (error) {
        attempts++
        if (error instanceof Error) {
          lastError = error
          logger.error(`Attempt ${attempts} failed:`, error)
        }

        // Record error metrics
        this.performanceTracker.recordLatency(this.currentProvider, Date.now() - startTime)
        this.performanceTracker.recordError(this.currentProvider)

        this.rotateProvider()
      }
    }

    throw lastError || new Error('Failed to generate response after all retries')
  }

  private selectProvider(taskType?: TaskType): ModelProvider {
    if (!taskType || !this.adaptiveRouting) {
      return this.currentProvider
    }

    const preferredProviders = this.routingPreferences[taskType]
    if (preferredProviders?.length) {
      // Find the best provider based on metrics
      const providerMetrics = preferredProviders.map(provider => ({
        provider,
        metrics: this.performanceTracker.getModelPerformance(provider),
      }))

      const bestProvider = providerMetrics
        .filter(
          ({ metrics }) =>
            metrics &&
            (!this.maxLatency ||
              metrics.latency.length === 0 ||
              metrics.latency.reduce((a: number, b: number) => a + b, 0) / metrics.latency.length <=
                this.maxLatency)
        )
        .sort((a, b) => {
          if (!a.metrics || !b.metrics) return 0
          const aScore = a.metrics.successRate - a.metrics.errorRate
          const bScore = b.metrics.successRate - b.metrics.errorRate
          return bScore - aScore
        })[0]

      if (bestProvider) {
        return bestProvider.provider
      }
    }

    return this.currentProvider
  }

  private rotateProvider(): void {
    const currentIndex = this.fallbackProviders.indexOf(this.currentProvider)
    const nextIndex = (currentIndex + 1) % this.fallbackProviders.length
    this.currentProvider = this.fallbackProviders[nextIndex]
  }
}
