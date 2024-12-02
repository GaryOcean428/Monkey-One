/// <reference types="vite/client" />

declare module 'vite' {
  export interface UserConfig {
    // Add any custom config options here
    [key: string]: any
  }

  export function defineConfig(config: UserConfig): UserConfig
}

declare module '@vitejs/plugin-react' {
  const plugin: () => any
  export default plugin
} 