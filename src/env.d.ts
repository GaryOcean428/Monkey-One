/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_XAI_API_KEY: string
    readonly VITE_GOOGLE_API_KEY: string
    readonly VITE_GOOGLE_SEARCH_ENGINE_ID: string
    // Add other environment variables as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv
} 