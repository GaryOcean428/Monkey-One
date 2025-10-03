/// <reference lib="dom" />
/// <reference lib="dom.iterable" />

import {
  ModelProvider,
  TaskType,
  ModelResponse,
  ModelOptions,
  PerformanceMetrics,
} from '../types/models'
import { ModelPerformanceTracker } from '../llm/ModelPerformanceTracker'
import { logger } from '../utils/logger'
import fetch from 'cross-fetch'

interface ModelClientConfig {
  defaultProvider?: ModelProvider
  fallbackProviders?: ModelProvider[]
  maxRetries?: number
  maxLatency?: number
  adaptiveRouting?: boolean
  routingPreferences?: {
    [key in TaskType]?: ModelProvider[]
  }
}

interface ModelError {
  message: string
  code?: string
  details?: unknown
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
    this.currentProvider = config.defaultProvider || 'granite3-dense-gpu'
    this.fallbackProviders = config.fallbackProviders || ['phi', 'o1-mini']
    this.maxRetries = config.maxRetries || 3
    this.maxLatency = config.maxLatency
    this.adaptiveRouting = config.adaptiveRouting || false
    this.routingPreferences = config.routingPreferences || {}
  }

  private async selectProvider(taskType: TaskType): Promise<ModelProvider> {
    if (!this.adaptiveRouting) {
      return this.currentProvider
    }

    const preferredProviders = this.routingPreferences[taskType]
    if (preferredProviders?.length) {
      for (const provider of preferredProviders) {
        const metrics = this.performanceTracker.getModelPerformance(provider)
        if (this.isProviderSuitable(metrics)) {
          return provider
        }
      }
    }

    // Try current provider first
    const currentMetrics = this.performanceTracker.getModelPerformance(this.currentProvider)
    if (this.isProviderSuitable(currentMetrics)) {
      return this.currentProvider
    }

    // Find best fallback provider
    for (const provider of this.fallbackProviders) {
      const metrics = this.performanceTracker.getModelPerformance(provider)
      if (this.isProviderSuitable(metrics)) {
        return provider
      }
    }

    // If no suitable provider found, return current
    return this.currentProvider
  }

  private isProviderSuitable(metrics: PerformanceMetrics): boolean {
    if (this.maxLatency && metrics.averageLatency > this.maxLatency) {
      return false
    }
    return metrics.successRate > 0.8 && metrics.errorRate < 0.2
  }

  public async generate(
    prompt: string,
    taskType: TaskType,
    options: ModelOptions = {}
  ): Promise<ModelResponse> {
    let lastError: ModelError | null = null

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      const provider = await this.selectProvider(taskType)

      try {
        const startTime = Date.now()
        const response = await this.makeRequest(provider, prompt, options)

        const latency = Date.now() - startTime
        this.performanceTracker.recordLatency(provider, latency)
        this.performanceTracker.recordSuccess(
          provider,
          response.usage.totalTokens,
          0 // Cost calculation would be provider-specific
        )

        return response
      } catch (error) {
        lastError = error as ModelError
        this.performanceTracker.recordError(provider)
        logger.error(`Provider ${provider} failed:`, error)

        if (attempt === this.maxRetries) {
          throw new Error(
            `All providers failed after ${this.maxRetries} attempts. Last error: ${lastError.message}`
          )
        }
      }
    }

    throw lastError
  }

  private async makeRequest(
    provider: ModelProvider,
    prompt: string,
    options: ModelOptions
  ): Promise<ModelResponse> {
    const endpoints: Record<ModelProvider, string> = {
      'granite3-dense-gpu': 'http://localhost:8000/v1/completions',
      phi: 'http://localhost:8001/v1/completions',
      'o1-mini': 'https://api.o1labs.ai/v1/completions',
      claude: 'https://api.anthropic.com/v1/complete',
      'claude-haiku': 'https://api.anthropic.com/v1/complete',
      grok: 'https://api.grok.ai/v1/chat/completions',
      'grok-40': 'https://api.grok.ai/v1/chat/completions',
      perplexity: 'https://api.perplexity.ai/v1/complete',
      llama: 'https://api.llama.ai/v1/chat/completions',
      groq: 'https://api.groq.ai/v1/completions',
      qwen: 'https://api.qwen.ai/v1/completions',
    }

    const endpoint = endpoints[provider]
    if (!endpoint) {
      throw new Error(`Unknown provider: ${provider}`)
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.getApiKey(provider)}`,
      },
      body: JSON.stringify({
        prompt,
        ...options,
        model: provider,
      }),
    })

    return this.handleResponse(response)
  }

  private async handleResponse(response: globalThis.Response): Promise<ModelResponse> {
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to process request')
    }
    const data = await response.json()
    return {
      content: data.text,
      model: data.model,
      usage: data.usage,
      metrics: data.metrics,
    }
  }

  private getApiKey(provider: ModelProvider): string {
    // In a real implementation, this would securely retrieve API keys
    // from environment variables or a key management service
    const mockKeys: Record<ModelProvider, string> = {
      'granite3-dense-gpu': 'local-dev-key',
      phi: 'local-dev-key',
      'o1-mini': process.env.O1_API_KEY || '',
      claude: process.env.ANTHROPIC_API_KEY || '',
      'claude-haiku': process.env.ANTHROPIC_API_KEY || '',
      grok: process.env.GROK_API_KEY || '',
      'grok-40': process.env.GROK_API_KEY || '',
      perplexity: process.env.PERPLEXITY_API_KEY || '',
      llama: process.env.LLAMA_API_KEY || '',
      groq: process.env.GROQ_API_KEY || '',
      qwen: process.env.QWEN_API_KEY || '',
    }

    const apiKey = mockKeys[provider]
    if (!apiKey) {
      throw new Error(`No API key found for provider: ${provider}`)
    }

    return apiKey
  }
}
