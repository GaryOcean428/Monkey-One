/// <reference types="vite/client" />

declare module 'vite/client' {
  interface ImportMetaEnv {
    readonly VITE_TOOLHOUSE_API_KEY: string
    readonly VITE_AI_MODEL_TEMPERATURE: string
    readonly VITE_AI_MAX_TOKENS: string
    readonly VITE_AI_TOP_P: string
    readonly VITE_AI_FREQUENCY_PENALTY: string
    readonly VITE_AI_PRESENCE_PENALTY: string
    readonly VITE_AI_STREAMING_ENABLED: string
  }
}
