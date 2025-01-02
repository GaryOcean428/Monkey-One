/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  readonly VITE_API_URL: string
  readonly VITE_SOCKET_URL: string
  readonly [key: string]: unknown
}

interface ImportMeta {
  readonly env: ImportMetaEnv
  readonly hot?: {
    readonly data: Record<string, unknown>
    accept(): void
    dispose(cb: () => void): void
  }
}

declare module 'vite' {
  export interface UserConfig {
    // Add any custom config options here
    [key: string]: unknown
  }

  export function defineConfig(config: UserConfig): UserConfig
}

declare module '@vitejs/plugin-react' {
  const plugin: () => any
  export default plugin
}