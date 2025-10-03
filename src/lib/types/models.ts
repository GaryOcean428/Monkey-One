export interface ModelConfig {
  name: string
  apiName: string
  provider: 'openai' | 'anthropic' | 'groq' | 'qwen' | 'local'
  parameters?: number
  contextWindow: number
  maxOutput: number
  releaseDate: string
  keyStrengths: string[]
  modelCardLink?: string
  quantization?: {
    bits: number
    scheme: string
  }
}

export type ModelProvider =
  | 'granite3-dense-gpu'
  | 'phi'
  | 'o1-mini'
  | 'claude'
  | 'claude-haiku'
  | 'grok'
  | 'grok-40'
  | 'perplexity'
  | 'llama'
  | 'groq'
  | 'qwen'

export type TaskType =
  | 'completion'
  | 'chat'
  | 'summarization'
  | 'translation'
  | 'classification'
  | 'code-generation'
  | 'code-review'
  | 'code-explanation'

export interface ErrorResponse {
  message: string
  code?: string
  details?: Record<string, any>
}

export interface SuccessResponse {
  text: string
  usage: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
  metrics?: PerformanceMetrics
}

export interface ModelResponse {
  content: string
  model: string
  usage: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
  metrics?: PerformanceMetrics
}

export interface StreamChunk {
  text: string
  isComplete: boolean
  metadata?: {
    model: string
    latency?: number
  }
}

export interface ModelOptions {
  temperature?: number
  maxTokens?: number
  stopSequences?: string[]
  topP?: number
  topK?: number
  presencePenalty?: number
  frequencyPenalty?: number
  metadata?: Record<string, unknown>
}

export interface ModelMetrics {
  totalRequests: number
  errorRate: number
  cacheHitRate: number
  averageLatency: number
  tokenUsage: {
    prompt: number
    completion: number
    total: number
  }
  lastUpdated: Date
}

export interface PerformanceMetrics {
  successRate: number
  errorRate: number
  averageLatency: number
  tokenUsage: number
  costPerToken: number
  qualityScores: {
    [key in TaskType]?: number[]
  }
}

export interface ModelCapabilities {
  supportedTasks: TaskType[]
  maxContextLength: number
  maxOutputLength: number
  streamingSupported: boolean
  costPerToken: number
  features: string[]
}

export interface ModelStats {
  totalRequests: number
  successfulRequests: number
  failedRequests: number
  totalTokens: number
  totalCost: number
  lastUpdated: number
}
