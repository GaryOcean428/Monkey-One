/**
 * Model configuration and types for supported LLM providers
 */

import { logger } from '../utils/logger';
import type { ModelOptions, ModelResponse, StreamChunk } from './types/models';

// Provider types
export type Provider = 'openai' | 'anthropic' | 'groq' | 'qwen' | 'local';

// Model configurations
export const models = {
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
  }
} as const;

/**
 * Get model configuration by model ID
 */
export function getModelConfig(modelId: string) {
  return models[modelId as keyof typeof models];
}

/**
 * Get all available models
 */
export function getAvailableModels(): string[] {
  return Object.keys(models);
}

/**
 * Get models by provider
 */
export function getModelsByProvider(provider: Provider) {
  return Object.entries(models)
    .filter(([, model]) => model.provider === provider)
    .map(([id]) => id);
}

/**
 * Validate if a model ID is supported
 */
export function isValidModel(modelId: string): boolean {
  return modelId in models;
}

/**
 * Generate a response using the specified model
 */
export async function generateResponse(
  prompt: string,
  modelName: string = 'local',
  options: ModelOptions = {}
): Promise<ModelResponse> {
  try {
    const model = getModelConfig(modelName);
    if (!model) {
      throw new Error(`Model ${modelName} not found. Available models: ${getAvailableModels().join(', ')}`);
    }

    // Rough token count estimation
    const estimatedTokens = Math.ceil(prompt.length / 4);
    const maxTokens = options.maxTokens || model.maxOutput;
    
    return {
      text: `Response to "${prompt}" using ${modelName} with temperature ${options.temperature || 0.7}`,
      usage: {
        promptTokens: estimatedTokens,
        completionTokens: maxTokens,
        totalTokens: estimatedTokens + maxTokens
      }
    };
  } catch (error) {
    logger.error('Error generating response:', error);
    throw error;
  }
}

/**
 * Generate a streaming response using the specified model
 */
export async function* generateStreamingResponse(
  prompt: string,
  modelName: string = 'local',
  options: ModelOptions = {}
): AsyncGenerator<StreamChunk> {
  try {
    const model = getModelConfig(modelName);
    if (!model) {
      throw new Error(`Model ${modelName} not found. Available models: ${getAvailableModels().join(', ')}`);
    }
    
    // Simulate streaming response with prompt and options
    const words = prompt.split(' ');
    const delay = options.streamingDelay || 50;
    
    for (const word of words) {
      yield {
        text: word + ' ',
        done: false
      };
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    yield {
      text: `\nGenerated with ${modelName}, temperature: ${options.temperature || 0.7}`,
      done: false
    };

    yield {
      text: '',
      done: true
    };
  } catch (error) {
    logger.error('Error in streaming response:', error);
    throw error;
  }
}