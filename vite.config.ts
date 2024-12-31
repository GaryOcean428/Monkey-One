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
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
      },
    },
    build: {
      outDir: 'dist',
      sourcemap: true,
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
        },
        external: [
          'events',
          '@sentry/node',
          'fs',
          'path',
          'os',
          'crypto',
          'stream',
          'util',
          'buffer',
          'url',
        ],
      },
    },
    optimizeDeps: {
      exclude: ['@sentry/node'],
    },
    server: {
      port: 3000,
      host: true,
    },
    preview: {
      port: 3000,
    },
    define: {
      'process.env': env,
    },
  }
})
