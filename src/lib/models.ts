/**
 * Model configuration and types for supported LLM providers
 */

// Imported models
import type { } from './types/models'

// Provider types
export type Provider = 'openai' | 'anthropic' | 'groq' | 'qwen' | 'local' | 'perplexity'

// Model configurations
export type ModelName =
  | 'granite3.1-dense:2b'
  | 'gpt-4o'
  | 'gpt-4o-mini'
  | 'gpt-4o-turbo'
  | 'gpt-4o-vision'
  | 'gpt-4o-realtime-preview'
  | 'gpt-4.5-turbo'
  | 'gpt-4.5-vision'
  | 'o1-preview'
  | 'o1-mini'
  | 'o3-preview'
  | 'o3-mini'
  | 'Qwen/QwQ-32B-Preview'
  | 'llama-3.3-70b-versatile'
  | 'llama-3.3-8b-versatile'
  | 'claude-3.7-sonnet'
  | 'claude-3.5-sonnet-20250214'
  | 'claude-3.5-haiku-20250523'
  | 'claude-3-opus-20240229'
  | 'phi3.5:latest'
  | 'llama-3.1-sonar-small-128k-online'
  | 'llama-3.1-sonar-large-128k-online'
  | 'llama-3.1-sonar-huge-128k-online'

// Default model for fallback
const _DEFAULT_MODEL: ModelName = 'granite3.1-dense:2b'

export interface ModelConfig {
  maxTokens: number
  costPerToken: number
  rateLimit: number // requests per minute
}

// Configuration for all supported models
const _MODEL_CONFIGS: Record<ModelName, ModelConfig> = {
  'granite3.1-dense:2b': {
    maxTokens: 8000,
    costPerToken: 0.00001,
    rateLimit: 2000,
  },
  'gpt-4o': {
    maxTokens: 128000,
    costPerToken: 0.00003,
    rateLimit: 500,
  },
  'gpt-4o-mini': {
    maxTokens: 128000,
    costPerToken: 0.00002,
    rateLimit: 1000,
  },
  'gpt-4o-turbo': {
    maxTokens: 128000,
    costPerToken: 0.00004,
    rateLimit: 400,
  },
  'gpt-4o-vision': {
    maxTokens: 128000,
    costPerToken: 0.00003,
    rateLimit: 500,
  },
  'gpt-4o-realtime-preview': {
    maxTokens: 128000,
    costPerToken: 0.00003,
    rateLimit: 600,
  },
  'gpt-4.5-turbo': {
    maxTokens: 300000,
    costPerToken: 0.00005,
    rateLimit: 300,
  },
  'gpt-4.5-vision': {
    maxTokens: 300000,
    costPerToken: 0.00005,
    rateLimit: 300,
  },
  'o1-preview': {
    maxTokens: 200000,
    costPerToken: 0.00004,
    rateLimit: 300,
  },
  'o1-mini': {
    maxTokens: 128000,
    costPerToken: 0.00003,
    rateLimit: 600,
  },
  'o3-preview': {
    maxTokens: 300000,
    costPerToken: 0.00006,
    rateLimit: 200,
  },
  'o3-mini': {
    maxTokens: 200000,
    costPerToken: 0.00004,
    rateLimit: 400,
  },
  'Qwen/QwQ-32B-Preview': {
    maxTokens: 32768,
    costPerToken: 0.00001,
    rateLimit: 2000,
  },
  'llama-3.3-70b-versatile': {
    maxTokens: 128000,
    costPerToken: 0.00002,
    rateLimit: 800,
  },
  'llama-3.3-8b-versatile': {
    maxTokens: 128000,
    costPerToken: 0.00001,
    rateLimit: 1500,
  },
  'claude-3.7-sonnet': {
    maxTokens: 200000,
    costPerToken: 0.00005,
    rateLimit: 300,
  },
  'claude-3.5-sonnet-20250214': {
    maxTokens: 200000,
    costPerToken: 0.00003,
    rateLimit: 400,
  },
  'claude-3.5-haiku-20250523': {
    maxTokens: 200000,
    costPerToken: 0.00002,
    rateLimit: 1000,
  },
  'claude-3-opus-20240229': {
    maxTokens: 200000,
    costPerToken: 0.00005,
    rateLimit: 250,
  },
  'phi3.5:latest': {
    maxTokens: 128000,
    costPerToken: 0.00001,
    rateLimit: 2000,
  },
  'llama-3.1-sonar-small-128k-online': {
    maxTokens: 127072,
    costPerToken: 0.00001,
    rateLimit: 2000,
  },
  'llama-3.1-sonar-large-128k-online': {
    maxTokens: 127072,
    costPerToken: 0.00002,
    rateLimit: 1000,
  },
  'llama-3.1-sonar-huge-128k-online': {
    maxTokens: 127072,
    costPerToken: 0.00003,
    rateLimit: 500,
  },
}

export const models = {
  'granite3.1-dense': {
    provider: 'local' as Provider,
    modelName: 'granite3.1-dense:2b',
    contextWindow: 8000,
    maxOutput: 4000,
    releaseDate: '2024-12',
    keyStrengths: ['Tool-based tasks', 'RAG', 'Code generation', 'Multilingual support'],
    modelCardUrl: 'https://ollama.com/library/granite3.1-dense',
  },

  'gpt-4o': {
    provider: 'openai' as Provider,
    modelName: 'gpt-4o',
    contextWindow: 128000,
    maxOutput: 16384,
    releaseDate: '2024-12',
    keyStrengths: ['General purpose tasks', 'Multimodal interactions', 'Complex reasoning'],
    modelCardUrl: 'https://platform.openai.com/docs/models',
  },

  'gpt-4o-mini': {
    provider: 'openai' as Provider,
    modelName: 'gpt-4o-mini',
    contextWindow: 128000,
    maxOutput: 16384,
    releaseDate: '2024-12',
    keyStrengths: ['Cost-effective general tasks', 'Fast responses'],
    modelCardUrl: 'https://platform.openai.com/docs/models',
  },

  'gpt-4o-turbo': {
    provider: 'openai' as Provider,
    modelName: 'gpt-4o-turbo',
    contextWindow: 128000,
    maxOutput: 16384,
    releaseDate: '2025-01',
    keyStrengths: ['Improved reasoning', 'Lower latency', 'Better instruction following'],
    modelCardUrl: 'https://platform.openai.com/docs/models',
  },

  'gpt-4o-vision': {
    provider: 'openai' as Provider,
    modelName: 'gpt-4o-vision',
    contextWindow: 128000,
    maxOutput: 16384,
    releaseDate: '2025-01',
    keyStrengths: ['Image analysis', 'Multimodal understanding', 'Strong visual processing'],
    modelCardUrl: 'https://platform.openai.com/docs/models',
  },

  'gpt-4o-realtime': {
    provider: 'openai' as Provider,
    modelName: 'gpt-4o-realtime-preview',
    contextWindow: 128000,
    maxOutput: 16384,
    releaseDate: '2025-01',
    keyStrengths: ['Voice interactions', 'Real-time conversations', 'Low latency audio processing'],
    modelCardUrl: 'https://platform.openai.com/docs/models',
  },

  'gpt-4.5-turbo': {
    provider: 'openai' as Provider,
    modelName: 'gpt-4.5-turbo',
    contextWindow: 300000,
    maxOutput: 100000,
    releaseDate: '2025-02',
    keyStrengths: ['Next-gen reasoning', 'Extremely large context', 'Exceptional accuracy'],
    modelCardUrl: 'https://platform.openai.com/docs/models',
  },

  'gpt-4.5-vision': {
    provider: 'openai' as Provider,
    modelName: 'gpt-4.5-vision',
    contextWindow: 300000,
    maxOutput: 100000,
    releaseDate: '2025-02',
    keyStrengths: ['Advanced visual understanding', 'Superior multimodal capabilities'],
    modelCardUrl: 'https://platform.openai.com/docs/models',
  },

  'o1-preview': {
    provider: 'openai' as Provider,
    modelName: 'o1-preview',
    contextWindow: 200000,
    maxOutput: 100000,
    releaseDate: '2025-01',
    keyStrengths: ['Complex reasoning', 'Advanced capabilities'],
    modelCardUrl: 'https://platform.openai.com/docs/models',
  },

  'o1-mini': {
    provider: 'openai' as Provider,
    modelName: 'o1-mini',
    contextWindow: 128000,
    maxOutput: 65536,
    releaseDate: '2025-01',
    keyStrengths: ['Fast reasoning', 'Specialized task optimization'],
    modelCardUrl: 'https://platform.openai.com/docs/models',
  },

  'o3-preview': {
    provider: 'openai' as Provider,
    modelName: 'o3-preview',
    contextWindow: 300000,
    maxOutput: 150000,
    releaseDate: '2025-03',
    keyStrengths: ['Advanced Reasoning', 'Multimodal integration', 'Tool use'],
    modelCardUrl: 'https://platform.openai.com/docs/models',
  },

  'o3-mini': {
    provider: 'openai' as Provider,
    modelName: 'o3-mini',
    contextWindow: 200000,
    maxOutput: 100000,
    releaseDate: '2025-03',
    keyStrengths: ['Fast inference', 'Cost-efficient tool use'],
    modelCardUrl: 'https://platform.openai.com/docs/models',
  },

  'qwq-32b': {
    provider: 'qwen' as Provider,
    modelName: 'Qwen/QwQ-32B-Preview',
    contextWindow: 32768,
    maxOutput: 32768,
    releaseDate: '2024-11',
    keyStrengths: ['Strong math/coding capabilities', 'Research-focused'],
    modelCardUrl: 'https://huggingface.co/Qwen/QwQ-32B-Preview',
  },

  'llama-3-70b': {
    provider: 'groq' as Provider,
    modelName: 'llama-3.3-70b-versatile',
    contextWindow: 128000,
    maxOutput: 32768,
    releaseDate: '2024-03',
    keyStrengths: ['Versatile large language model', 'High performance'],
    modelCardUrl: 'https://console.groq.com/docs/models',
  },

  'llama-3-8b': {
    provider: 'groq' as Provider,
    modelName: 'llama-3.3-8b-versatile',
    contextWindow: 128000,
    maxOutput: 32768,
    releaseDate: '2024-03',
    keyStrengths: ['Fast responses', 'Cost-effective solution'],
    modelCardUrl: 'https://console.groq.com/docs/models',
  },

  'claude-3.7-sonnet': {
    provider: 'anthropic' as Provider,
    modelName: 'claude-3.7-sonnet',
    contextWindow: 200000,
    maxOutput: 150000,
    releaseDate: '2025-02',
    keyStrengths: ['Superior reasoning', 'Most advanced Claude model', 'Text/image/audio support'],
    modelCardUrl: 'https://docs.anthropic.com/en/docs/about-claude',
  },

  'claude-3.5-sonnet': {
    provider: 'anthropic' as Provider,
    modelName: 'claude-3.5-sonnet-20250214',
    contextWindow: 200000,
    maxOutput: 100000,
    releaseDate: '2025-02',
    keyStrengths: ['Exceptional reasoning', 'Reduced hallucinations', 'High accuracy'],
    modelCardUrl: 'https://docs.anthropic.com/en/docs/about-claude',
  },

  'claude-3.5-haiku': {
    provider: 'anthropic' as Provider,
    modelName: 'claude-3.5-haiku-20250523',
    contextWindow: 200000,
    maxOutput: 100000,
    releaseDate: '2025-05',
    keyStrengths: ['Fast responses', 'Cost-effective interactions'],
    modelCardUrl: 'https://docs.anthropic.com/en/docs/about-claude',
  },

  'claude-3-opus': {
    provider: 'anthropic' as Provider,
    modelName: 'claude-3-opus-20240229',
    contextWindow: 200000,
    maxOutput: 100000,
    releaseDate: '2024-02',
    keyStrengths: ['Deep reasoning', 'Accuracy on complex topics'],
    modelCardUrl: 'https://docs.anthropic.com/en/docs/about-claude',
  },

  'phi-3-5': {
    provider: 'local' as Provider,
    modelName: 'phi3.5:latest',
    contextWindow: 128000,
    maxOutput: 32768,
    releaseDate: '2024-01',
    keyStrengths: ['Lightweight', 'Strong performance'],
    modelCardUrl: 'https://ollama.com/library/phi3.5',
  },

  'sonar-small': {
    provider: 'perplexity' as Provider,
    modelName: 'llama-3.1-sonar-small-128k-online',
    contextWindow: 127072,
    maxOutput: 32768,
    releaseDate: '2024-01',
    keyStrengths: ['Fast online search capabilities'],
    modelCardUrl: 'https://docs.perplexity.ai/guides/model-cards',
  },

  'sonar-large': {
    provider: 'perplexity' as Provider,
    modelName: 'llama-3.1-sonar-large-128k-online',
    contextWindow: 127072,
    maxOutput: 32768,
    releaseDate: '2024-01',
    keyStrengths: ['Advanced reasoning with integrated search'],
    modelCardUrl: 'https://docs.perplexity.ai/guides/model-cards',
  },

  'sonar-huge': {
    provider: 'perplexity' as Provider,
    modelName: 'llama-3.1-sonar-huge-128k-online',
    contextWindow: 127072,
    maxOutput: 32768,
    releaseDate: '2024-01',
    keyStrengths: ['Most powerful search-augmented model'],
    modelCardUrl: 'https://docs.perplexity.ai/guides/model-cards',
  },
} as const

// Rest of the file remains unchanged
