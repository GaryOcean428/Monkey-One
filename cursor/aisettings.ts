/// <reference types="vite/client" />

export const AI_CONFIG = {
  temperature: Number(import.meta.env.VITE_AI_MODEL_TEMPERATURE) || 0.7,
  maxTokens: Number(import.meta.env.VITE_AI_MAX_TOKENS) || 4096,
  topP: Number(import.meta.env.VITE_AI_TOP_P) || 0.9,
  frequencyPenalty: Number(import.meta.env.VITE_AI_FREQUENCY_PENALTY) || 0.0,
  presencePenalty: Number(import.meta.env.VITE_AI_PRESENCE_PENALTY) || 0.0,
  timeout: Number(import.meta.env.VITE_AI_TIMEOUT) || 30000,
  retryAttempts: Number(import.meta.env.VITE_AI_RETRY_ATTEMPTS) || 3,
  batchSize: Number(import.meta.env.VITE_AI_BATCH_SIZE) || 32,
  features: {
    streaming: import.meta.env.VITE_AI_STREAMING_ENABLED === 'true',
    caching: import.meta.env.VITE_AI_CACHING_ENABLED === 'true',
    logging: import.meta.env.VITE_AI_LOGGING_ENABLED === 'true'
  }
} as const;

export const API_KEYS = {
  xai: import.meta.env.VITE_XAI_API_KEY,
  groq: import.meta.env.VITE_GROQ_API_KEY,
  perplexity: import.meta.env.VITE_PERPLEXITY_API_KEY,
  huggingface: import.meta.env.VITE_HUGGINGFACE_TOKEN,
  anthropic: import.meta.env.VITE_ANTHROPIC_API_KEY
} as const;

export default {
  aiConfig: AI_CONFIG,
  apiKeys: API_KEYS
}; 