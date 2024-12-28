/**
 * Model configuration and types for supported LLM providers
 */

import { logger } from '../utils/logger';
import type { ModelOptions, ModelResponse, StreamChunk } from './types/models';

// Provider types
export type Provider = 'openai' | 'anthropic' | 'groq' | 'qwen' | 'local' | 'perplexity';

// Model configurations
export type ModelName = 
  | 'granite3.1-dense:2b'
  | 'gpt-4o-2024-11-06'
  | 'gpt-4o-mini-2024-07-18'
  | 'o1-2024-12-01'
  | 'o1-mini-2024-09-15'
  | 'Qwen/QwQ-32B-Preview'
  | 'llama-3.3-70b-versatile'
  | 'claude-3-5-sonnet-v2@20241022'
  | 'claude-3-5-haiku@20241022'
  | 'phi3.5:latest'
  | 'llama-3.1-sonar-small-128k-online'
  | 'llama-3.1-sonar-large-128k-online'
  | 'llama-3.1-sonar-huge-128k-online';

const DEFAULT_MODEL: ModelName = 'granite3.1-dense:2b';

interface ModelConfig {
  maxTokens: number;
  costPerToken: number;
  rateLimit: number; // requests per minute
}

const MODEL_CONFIGS: Record<ModelName, ModelConfig> = {
  'granite3.1-dense:2b': {
    maxTokens: 8000,
    costPerToken: 0.00001,
    rateLimit: 2000
  },
  'gpt-4o-2024-11-06': {
    maxTokens: 128000,
    costPerToken: 0.00003,
    rateLimit: 500
  },
  'gpt-4o-mini-2024-07-18': {
    maxTokens: 128000,
    costPerToken: 0.00002,
    rateLimit: 1000
  },
  'o1-2024-12-01': {
    maxTokens: 200000,
    costPerToken: 0.00004,
    rateLimit: 300
  },
  'o1-mini-2024-09-15': {
    maxTokens: 128000,
    costPerToken: 0.00003,
    rateLimit: 600
  },
  'Qwen/QwQ-32B-Preview': {
    maxTokens: 32768,
    costPerToken: 0.00001,
    rateLimit: 2000
  },
  'llama-3.3-70b-versatile': {
    maxTokens: 128000,
    costPerToken: 0.00002,
    rateLimit: 800
  },
  'claude-3-5-sonnet-v2@20241022': {
    maxTokens: 200000,
    costPerToken: 0.00003,
    rateLimit: 400
  },
  'claude-3-5-haiku@20241022': {
    maxTokens: 200000,
    costPerToken: 0.00002,
    rateLimit: 1000
  },
  'phi3.5:latest': {
    maxTokens: 128000,
    costPerToken: 0.00001,
    rateLimit: 2000
  },
  'llama-3.1-sonar-small-128k-online': {
    maxTokens: 127072,
    costPerToken: 0.00001,
    rateLimit: 2000
  },
  'llama-3.1-sonar-large-128k-online': {
    maxTokens: 127072,
    costPerToken: 0.00002,
    rateLimit: 1000
  },
  'llama-3.1-sonar-huge-128k-online': {
    maxTokens: 127072,
    costPerToken: 0.00003,
    rateLimit: 500
  }
};

export const models = {
  'granite3.1-dense': {
    provider: 'local' as Provider,
    modelName: 'granite3.1-dense:2b',
    contextWindow: 8000,
    maxOutput: 4000,
    releaseDate: '2024-12',
    keyStrengths: ['Tool-based tasks', 'RAG', 'Code generation', 'Multilingual support'],
    modelCardUrl: 'https://ollama.com/library/granite3.1-dense'
  },
  
  'gpt-4o': {
    provider: 'openai' as Provider,
    modelName: 'gpt-4o-2024-11-06',
    contextWindow: 128000,
    maxOutput: 16384,
    releaseDate: '2024-11',
    keyStrengths: ['Versatile flagship model', 'Text/image input support'],
    modelCardUrl: 'https://platform.openai.com/docs/models'
  },
  
  'gpt-4o-mini': {
    provider: 'openai' as Provider,
    modelName: 'gpt-4o-mini-2024-07-18',
    contextWindow: 128000,
    maxOutput: 16384,
    releaseDate: '2024-07',
    keyStrengths: ['Fast inference', 'Cost-effective for focused tasks'],
    modelCardUrl: 'https://platform.openai.com/docs/models'
  },
  
  'o1': {
    provider: 'openai' as Provider,
    modelName: 'o1-2024-12-01',
    contextWindow: 200000,
    maxOutput: 100000,
    releaseDate: '2024-12',
    keyStrengths: ['Complex reasoning', 'Advanced capabilities'],
    modelCardUrl: 'https://platform.openai.com/docs/models'
  },
  
  'o1-mini': {
    provider: 'openai' as Provider,
    modelName: 'o1-mini-2024-09-15',
    contextWindow: 128000,
    maxOutput: 65536,
    releaseDate: '2024-09',
    keyStrengths: ['Fast reasoning', 'Specialized task optimization'],
    modelCardUrl: 'https://platform.openai.com/docs/models'
  },
  
  'qwq-32b': {
    provider: 'qwen' as Provider,
    modelName: 'Qwen/QwQ-32B-Preview',
    contextWindow: 32768,
    maxOutput: 32768,
    releaseDate: '2024-11',
    keyStrengths: ['Strong math/coding capabilities', 'Research-focused'],
    modelCardUrl: 'https://huggingface.co/Qwen/QwQ-32B-Preview'
  },
  
  'llama-3-70b': {
    provider: 'groq' as Provider,
    modelName: 'llama-3.3-70b-versatile',
    contextWindow: 128000,
    maxOutput: 32768,
    releaseDate: '2024-03',
    keyStrengths: ['Versatile large language model', 'High performance'],
    modelCardUrl: 'https://console.groq.com/docs/models'
  },
  
  'claude-3-sonnet': {
    provider: 'anthropic' as Provider,
    modelName: 'claude-3-5-sonnet-v2@20241022',
    contextWindow: 200000,
    maxOutput: 100000,
    releaseDate: '2024-04',
    keyStrengths: ['Advanced intelligence', 'Text/image input support'],
    modelCardUrl: 'https://docs.anthropic.com/en/docs/about-claude'
  },
  
  'claude-3-haiku': {
    provider: 'anthropic' as Provider,
    modelName: 'claude-3-5-haiku@20241022',
    contextWindow: 200000,
    maxOutput: 100000,
    releaseDate: '2024-07',
    keyStrengths: ['Fast inference', 'Efficient processing'],
    modelCardUrl: 'https://docs.anthropic.com/en/docs/about-claude'
  },

  'phi-3-5': {
    provider: 'local' as Provider,
    modelName: 'phi3.5:latest',
    contextWindow: 128000,
    maxOutput: 32768,
    releaseDate: '2024-Q1',
    keyStrengths: ['Lightweight', 'Strong performance'],
    modelCardUrl: 'https://ollama.com/library/phi3.5'
  },

  'sonar-small': {
    provider: 'perplexity' as Provider,
    modelName: 'llama-3.1-sonar-small-128k-online',
    contextWindow: 127072,
    maxOutput: 32768,
    releaseDate: '2024-Q1',
    keyStrengths: ['Fast online search capabilities'],
    modelCardUrl: 'https://docs.perplexity.ai/guides/model-cards'
  },

  'sonar-large': {
    provider: 'perplexity' as Provider,
    modelName: 'llama-3.1-sonar-large-128k-online',
    contextWindow: 127072,
    maxOutput: 32768,
    releaseDate: '2024-Q1',
    keyStrengths: ['Advanced reasoning with integrated search'],
    modelCardUrl: 'https://docs.perplexity.ai/guides/model-cards'
  },

  'sonar-huge': {
    provider: 'perplexity' as Provider,
    modelName: 'llama-3.1-sonar-huge-128k-online',
    contextWindow: 127072,
    maxOutput: 32768,
    releaseDate: '2024-Q1',
    keyStrengths: ['Most powerful search-augmented model'],
    modelCardUrl: 'https://docs.perplexity.ai/guides/model-cards'
  }
} as const;

// Rest of the file remains unchanged