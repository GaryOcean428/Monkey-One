/// <reference types="vite/client" />

export interface ImportMetaEnv extends Record<string, string | undefined> {
  // Public URL and API Configuration
  readonly VITE_PUBLIC_URL?: string
  readonly VITE_API_BASE_URL?: string

  // Supabase Configuration
  readonly VITE_SUPABASE_URL?: string
  readonly VITE_SUPABASE_ANON_KEY?: string
  readonly VITE_SUPABASE_SERVICE_ROLE_KEY?: string

  // AI Model API Keys
  readonly VITE_XAI_API_KEY?: string
  readonly VITE_GROQ_API_KEY?: string
  readonly VITE_PERPLEXITY_API_KEY?: string
  readonly VITE_HUGGINGFACE_TOKEN?: string
  readonly VITE_ANTHROPIC_API_KEY?: string

  // AI Model Settings
  readonly VITE_AI_MODEL_TEMPERATURE?: string
  readonly VITE_AI_MAX_TOKENS?: string
  readonly VITE_AI_TOP_P?: string
  readonly VITE_AI_FREQUENCY_PENALTY?: string
  readonly VITE_AI_PRESENCE_PENALTY?: string
  readonly VITE_AI_TIMEOUT?: string
  readonly VITE_AI_RETRY_ATTEMPTS?: string
  readonly VITE_AI_BATCH_SIZE?: string

  // AI Feature Flags
  readonly VITE_AI_STREAMING_ENABLED?: string
  readonly VITE_AI_CACHING_ENABLED?: string
  readonly VITE_AI_LOGGING_ENABLED?: string
}

export interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module 'vite/client' {
  interface ImportMetaEnv extends Record<string, string | undefined> {}
  interface ImportMeta {
    readonly env: ImportMetaEnv
  }
}

// Define global window extensions for runtime environment variables
interface Window {
  ENV?: {
    VITE_PUBLIC_URL?: string;
    [key: string]: any;
  };
  PUBLIC_URL?: string;
}
