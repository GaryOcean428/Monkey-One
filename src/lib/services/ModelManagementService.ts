import { EventEmitter } from 'events'
import { ModelProvider, ModelResponse, ModelOptions, TaskType, StreamChunk } from '../types/models'
import { ModelPerformanceTracker } from '../llm/ModelPerformanceTracker'
import { LocalProvider } from '../providers/LocalProvider'
import { logger } from '../utils/logger'

interface ModelConfig {
  provider: ModelProvider
  maxRetries: number
  timeout: number
  fallbackThreshold: number
  qualityThreshold: number
}

interface ProviderHealth {
  isHealthy: boolean
  lastCheck: number
  consecutiveFailures: number
  averageLatency: number
}

export class ModelManagementService extends EventEmitter {
  private static instance: ModelManagementService
  private performanceTracker: ModelPerformanceTracker
  private providers: Map<ModelProvider, any>
  private providerHealth: Map<ModelProvider, ProviderHealth>
  private readonly config: ModelConfig
  private primaryProvider: ModelProvider
  private fallbackProviders: ModelProvider[]

  private constructor(config: Partial<ModelConfig> = {}) {
    super()
    this.config = {
      provider: config.provider || 'granite3-dense-gpu',
      maxRetries: config.maxRetries || 3,
      timeout: config.timeout || 30000,
      fallbackThreshold: config.fallbackThreshold || 0.8,
      qualityThreshold: config.qualityThreshold || 0.7,
    }
    this.performanceTracker = ModelPerformanceTracker.getInstance()
    this.providers = new Map()
    this.providerHealth = new Map()
    this.primaryProvider = this.config.provider
    this.fallbackProviders = ['phi', 'o1-mini']
    this.initializeProviders()
  }

  public static getInstance(config?: Partial<ModelConfig>): ModelManagementService {
    if (!ModelManagementService.instance) {
      ModelManagementService.instance = new ModelManagementService(config)
    }
    return ModelManagementService.instance
  }

  private async initializeProviders(): Promise<void> {
    // Initialize primary provider
    this.providers.set(this.primaryProvider, new LocalProvider())
    this.providerHealth.set(this.primaryProvider, {
      isHealthy: true,
      lastCheck: Date.now(),
      consecutiveFailures: 0,
      averageLatency: 0,
    })

    // Initialize fallback providers
    for (const provider of this.fallbackProviders) {
      try {
        const providerInstance = new LocalProvider() // Replace with actual provider initialization
        this.providers.set(provider, providerInstance)
        this.providerHealth.set(provider, {
          isHealthy: true,
          lastCheck: Date.now(),
          consecutiveFailures: 0,
          averageLatency: 0,
        })
      } catch (error) {
        logger.error(`Failed to initialize provider ${provider}:`, error)
      }
    }
  }

  private async checkProviderHealth(provider: ModelProvider): Promise<boolean> {
    const health = this.providerHealth.get(provider)
    if (!health) return false

    const providerInstance = this.providers.get(provider)
    if (!providerInstance) return false

    try {
      const startTime = Date.now()
      await providerInstance.isAvailable()
      const latency = Date.now() - startTime

      health.lastCheck = Date.now()
      health.isHealthy = true
      health.consecutiveFailures = 0
      health.averageLatency = health.averageLatency * 0.9 + latency * 0.1

      return true
    } catch (error) {
      health.consecutiveFailures++
      health.isHealthy = health.consecutiveFailures < 3
      logger.warn(`Provider ${provider} health check failed:`, error)
      return false
    }
  }

  private async selectProvider(taskType: TaskType): Promise<ModelProvider> {
    // Check primary provider first
    const primaryHealth = await this.checkProviderHealth(this.primaryProvider)
    if (primaryHealth) {
      const metrics = this.performanceTracker.getModelPerformance(this.primaryProvider)
      if (
        metrics.successRate > this.config.fallbackThreshold &&
        metrics.qualityScores[taskType] > this.config.qualityThreshold
      ) {
        return this.primaryProvider
      }
    }

    // Find best fallback provider
    let bestProvider = this.primaryProvider
    let bestScore = -1

    for (const provider of this.fallbackProviders) {
      const isHealthy = await this.checkProviderHealth(provider)
      if (!isHealthy) continue

      const metrics = this.performanceTracker.getModelPerformance(provider)
      const score =
        metrics.successRate * 0.4 +
        (metrics.qualityScores[taskType] || 0) * 0.4 +
        (1 - metrics.averageLatency / 1000) * 0.2

      if (score > bestScore) {
        bestScore = score
        bestProvider = provider
      }
    }

    return bestProvider
  }

  public async generate(
    prompt: string,
    taskType: TaskType,
    options: ModelOptions = {}
  ): Promise<ModelResponse> {
    let lastError: Error | null = null
    const startTime = Date.now()

    for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
      const provider = await this.selectProvider(taskType)
      const providerInstance = this.providers.get(provider)

      try {
        const response = await providerInstance.generate(prompt, options)

        // Record success metrics
        const latency = Date.now() - startTime
        this.performanceTracker.recordLatency(provider, latency)
        this.performanceTracker.recordSuccess(
          provider,
          response.usage?.totalTokens || 0,
          response.usage?.cost || 0
        )

        return response
      } catch (error) {
        lastError = error as Error
        this.performanceTracker.recordError(provider)
        logger.error(`Provider ${provider} failed:`, error)

        // If this is the last attempt, throw the error
        if (attempt === this.config.maxRetries) {
          throw new Error(
            `All providers failed after ${this.config.maxRetries} attempts. Last error: ${lastError.message}`
          )
        }
      }
    }

    throw lastError
  }

  public async generateStream(
    prompt: string,
    taskType: TaskType,
    options: ModelOptions = {}
  ): AsyncGenerator<StreamChunk> {
    const provider = await this.selectProvider(taskType)
    const providerInstance = this.providers.get(provider)

    if (!providerInstance) {
      throw new Error(`Provider ${provider} not initialized`)
    }

    const startTime = Date.now()
    let totalTokens = 0

    try {
      const stream = providerInstance.generateStream(prompt, options)
      for await (const chunk of stream) {
        totalTokens += chunk.tokens || 0
        yield chunk
      }

      const latency = Date.now() - startTime
      this.performanceTracker.recordLatency(provider, latency)
      this.performanceTracker.recordSuccess(provider, totalTokens, 0) // Cost calculation would be provider-specific
    } catch (error) {
      this.performanceTracker.recordError(provider)
      throw error
    }
  }

  public async recordQualityScore(
    provider: ModelProvider,
    taskType: TaskType,
    score: number
  ): Promise<void> {
    this.performanceTracker.recordQualityScore(provider, taskType, score)
  }

  public getProviderHealth(provider: ModelProvider): ProviderHealth | undefined {
    return this.providerHealth.get(provider)
  }

  public getAllProviderHealth(): Map<ModelProvider, ProviderHealth> {
    return new Map(this.providerHealth)
  }
}
