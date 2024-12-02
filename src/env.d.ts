/// <reference types="vite/client" />

export interface ImportMetaEnv {
  // AI Model API Keys
  readonly VITE_XAI_API_KEY: string
  readonly VITE_GROQ_API_KEY: string
  readonly VITE_PERPLEXITY_API_KEY: string
  readonly VITE_HUGGINGFACE_TOKEN: string
  readonly VITE_ANTHROPIC_API_KEY: string

  // AI Model Settings
  readonly VITE_AI_MODEL_TEMPERATURE: string
  readonly VITE_AI_MAX_TOKENS: string
  readonly VITE_AI_TOP_P: string
  readonly VITE_AI_FREQUENCY_PENALTY: string
  readonly VITE_AI_PRESENCE_PENALTY: string
  readonly VITE_AI_TIMEOUT: string
  readonly VITE_AI_RETRY_ATTEMPTS: string
  readonly VITE_AI_BATCH_SIZE: string

  // AI Feature Flags
  readonly VITE_AI_STREAMING_ENABLED: string
  readonly VITE_AI_CACHING_ENABLED: string
  readonly VITE_AI_LOGGING_ENABLED: string

  // Firebase Configuration
  readonly VITE_FIREBASE_API_KEY: string
  readonly VITE_FIREBASE_AUTH_DOMAIN: string
  readonly VITE_FIREBASE_PROJECT_ID: string
  readonly VITE_FIREBASE_STORAGE_BUCKET: string
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string
  readonly VITE_FIREBASE_APP_ID: string
  readonly VITE_FIREBASE_DATABASE_URL: string
  readonly VITE_FIREBASE_MEASUREMENT_ID?: string

  // Other configurations
  [key: string]: string | undefined
}

export interface ImportMeta {
  readonly env: ImportMetaEnv
} 