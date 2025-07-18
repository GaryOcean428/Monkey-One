/// <reference types="vite/client" />
/// <reference types="node" />

declare module '*.svg' {
  import * as React from 'react'
  const ReactComponent: React.FunctionComponent<React.SVGProps<SVGElement>>
  export { ReactComponent }
  const src: string
  export default src
}

declare module '*.png' {
  const content: string
  export default content
}

declare module '*.jpg' {
  const content: string
  export default content
}

declare module '*.jpeg' {
  const content: string
  export default content
}

declare module '*.gif' {
  const content: string
  export default content
}

declare module '*.webp' {
  const content: string
  export default content
}

declare module '*.ico' {
  const content: string
  export default content
}

declare module '*.bmp' {
  const content: string
  export default content
}

interface ImportMetaEnv {
  readonly VITE_PUBLIC_URL: string
  readonly VITE_APP_TITLE: string
  readonly VITE_API_URL: string
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_SUPABASE_SERVICE_ROLE_KEY: string
  readonly VITE_SUPABASE_JWT_SECRET: string
  readonly VITE_PINECONE_API_KEY: string
  readonly VITE_PINECONE_ENVIRONMENT: string
  readonly VITE_PINECONE_INDEX_NAME: string
  readonly VITE_OLLAMA_BASE_URL: string
  readonly VITE_CHROMA_CLOUD_TOKEN: string
  readonly VITE_OPENAI_API_KEY: string
  readonly VITE_AUTH_ENABLED: string
  readonly VITE_ENABLE_ANALYTICS: string
  readonly VITE_ENABLE_BRAIN_VISUALIZER: string
  // Add other VITE_ prefixed variables as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}