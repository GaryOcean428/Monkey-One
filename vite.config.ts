/// <reference types="node" />
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import dotenv from 'dotenv'
import compression from 'vite-plugin-compression'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

// Load environment variables
dotenv.config()
dotenv.config({ path: '.env.local' })

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on mode
  const env = loadEnv(mode, __dirname, '')

  return {
    plugins: [
      react(),
      compression({
        algorithm: 'gzip',
        ext: '.gz',
      }),
      compression({
        algorithm: 'brotliCompress',
        ext: '.br',
      }),
    ],
    optimizeDeps: {
      include: [
        '@radix-ui/react-slider',
        '@radix-ui/react-tabs',
        '@radix-ui/react-switch',
        '@radix-ui/react-select',
      ],
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
        '~': resolve(__dirname, './'),
      },
    },
    define: {
      global: 'globalThis',
      ...Object.keys(env).reduce<Record<string, string>>((acc: Record<string, string>, key) => {
        if (key.startsWith('VITE_')) {
          acc[`import.meta.env.${key}`] = JSON.stringify(env[key])
        }
        return acc
      }, {}),
    },
    build: {
      outDir: 'dist',
      sourcemap: true,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: [
              'react',
              'react-dom',
              'react-router-dom',
              '@radix-ui/react-slider',
              '@radix-ui/react-tabs',
              '@radix-ui/react-switch',
              '@radix-ui/react-select',
            ],
          },
        },
      },
      chunkSizeWarningLimit: 1000,
    },
    server: {
      port: 3000,
      host: true,
      strictPort: true,
      watch: {
        usePolling: true,
        interval: 100,
      },
    },
  }
})
