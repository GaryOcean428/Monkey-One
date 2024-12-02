// AI Model Configuration Rules
export const AI_RULES = {
  // Temperature bounds (0.0-1.0)
  temperature: {
    min: 0.0,
    max: 1.0,
    default: Number(import.meta.env.VITE_AI_MODEL_TEMPERATURE) || 0.7
  },
  
  // Token limits
  maxTokens: {
    min: 1,
    max: 32768,
    default: Number(import.meta.env.VITE_AI_MAX_TOKENS) || 4096
  },
  
  // Top P bounds (0.0-1.0)
  topP: {
    min: 0.0,
    max: 1.0,
    default: Number(import.meta.env.VITE_AI_TOP_P) || 0.9
  },
  
  // Frequency penalty bounds (-2.0 to 2.0)
  frequencyPenalty: {
    min: -2.0,
    max: 2.0,
    default: Number(import.meta.env.VITE_AI_FREQUENCY_PENALTY) || 0.0
  },
  
  // Presence penalty bounds (-2.0 to 2.0)
  presencePenalty: {
    min: -2.0,
    max: 2.0,
    default: Number(import.meta.env.VITE_AI_PRESENCE_PENALTY) || 0.0
  },

  // Request timeout (in milliseconds)
  timeout: {
    min: 1000,
    max: 300000, // 5 minutes
    default: Number(import.meta.env.VITE_AI_TIMEOUT) || 30000
  },
  
  // Retry attempts
  retryAttempts: {
    min: 0,
    max: 10,
    default: Number(import.meta.env.VITE_AI_RETRY_ATTEMPTS) || 3
  },
  
  // Batch size limits
  batchSize: {
    min: 1,
    max: 128,
    default: Number(import.meta.env.VITE_AI_BATCH_SIZE) || 32
  }
} as const;

// Feature Flag Rules
export const FEATURE_FLAGS = {
  streaming: {
    enabled: import.meta.env.VITE_AI_STREAMING_ENABLED === 'true',
    requiresAuth: true,
    minTokens: 1,
    maxTokens: 32768
  },
  caching: {
    enabled: import.meta.env.VITE_AI_CACHING_ENABLED === 'true',
    ttl: 3600, // 1 hour in seconds
    maxSize: 1000 // Maximum number of cached responses
  },
  logging: {
    enabled: import.meta.env.VITE_AI_LOGGING_ENABLED === 'true',
    level: 'info',
    maxLogSize: 10 * 1024 * 1024 // 10MB
  }
} as const;

// API Rate Limiting Rules
export const RATE_LIMITS = {
  requests: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  },
  tokens: {
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
    max: 1000000 // 1M tokens per day
  }
} as const;

// Security Rules
export const SECURITY_RULES = {
  auth: {
    requiresAuth: true,
    sessionTimeout: 3600, // 1 hour in seconds
    maxFailedAttempts: 5,
    lockoutDuration: 15 * 60 // 15 minutes in seconds
  },
  cors: {
    allowedOrigins: ['http://localhost:3000'],
    allowedMethods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400 // 24 hours in seconds
  }
} as const;

// Export configuration
export default {
  aiRules: AI_RULES,
  featureFlags: FEATURE_FLAGS,
  rateLimits: RATE_LIMITS,
  securityRules: SECURITY_RULES
}; 