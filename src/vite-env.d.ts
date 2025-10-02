/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GOOGLE_CLIENT_ID: string
  readonly VITE_GOOGLE_CLIENT_SECRET: string
  readonly VITE_PUBLIC_URL: string
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_API_BASE_URL: string
  readonly VITE_PINECONE_API_KEY: string
  readonly VITE_PINECONE_ENVIRONMENT: string
  readonly VITE_PINECONE_INDEX_NAME: string
  readonly VITE_OPENAI_API_KEY: string
  readonly VITE_ANTHROPIC_API_KEY: string
  readonly VITE_GROQ_API_KEY: string
  readonly VITE_XAI_API_KEY: string
  readonly VITE_HF_API_KEY: string
  readonly VITE_PERPLEXITY_API_KEY: string
  readonly VITE_CHROMA_CLOUD_TOKEN: string
  readonly VITE_OLLAMA_BASE_URL: string
  readonly VITE_AUTH_ENABLED: string
  readonly VITE_ENABLE_ANALYTICS: string
  readonly VITE_ENABLE_BRAIN_VISUALIZER: string
  readonly VITE_AI_STREAMING_ENABLED: string
  readonly VITE_AI_MAX_TOKENS: string
  readonly VITE_AI_MODEL_TEMPERATURE: string
  readonly VITE_AI_TOP_P: string
  readonly VITE_AI_FREQUENCY_PENALTY: string
  readonly VITE_AI_PRESENCE_PENALTY: string
  readonly VITE_AI_RETRY_ATTEMPTS: string
  readonly VITE_DEMO_MODE: string
  readonly VITE_OIDC_ENABLED: string
  readonly VITE_OIDC_ISSUER_MODE: string
  readonly VITE_VERCEL_SKEW_PROTECTION_ENABLED: string
  readonly VITE_VERCEL_DEPLOYMENT_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
