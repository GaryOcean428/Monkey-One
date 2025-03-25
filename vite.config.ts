import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import compression from 'vite-plugin-compression'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import tsconfigPaths from 'vite-tsconfig-paths'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on mode
  const env = loadEnv(mode, __dirname, '')

  return {
    plugins: [
      react(),
      tsconfigPaths(),
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
      extensions: ['.js', '.ts', '.jsx', '.tsx', '.json'],
    },
    build: {
      outDir: 'dist',
      sourcemap: true,
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
        },
        external: ['events', '@sentry/node', 'pino-pretty', 'winston', 'prom-client', 'crypto'],
      },
      assetsDir: 'assets',
      copyPublicDir: true,
      // Ensure manifest.json and other static files are properly copied
      manifest: true,
    },
    publicDir: 'public',
    optimizeDeps: {
      exclude: ['@sentry/node'],
    },
    server: {
      port: 3000,
      host: true,
      // Ensure static assets are served correctly
      fs: {
        allow: ['.'],
      },
    },
    preview: {
      port: 3000,
    },
    define: {
      // Ensure all environment variables are properly defined with fallbacks
      'import.meta.env.VITE_PUBLIC_URL': JSON.stringify(
        env.VITE_PUBLIC_URL || 'http://localhost:3000'
      ),
      'process.env.VITE_PUBLIC_URL': JSON.stringify(env.VITE_PUBLIC_URL || 'http://localhost:3000'),
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY),
      'import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY': JSON.stringify(
        env.VITE_SUPABASE_SERVICE_ROLE_KEY
      ),
      'import.meta.env.VITE_SUPABASE_JWT_SECRET': JSON.stringify(env.VITE_SUPABASE_JWT_SECRET),
      'import.meta.env.VITE_PINECONE_API_KEY': JSON.stringify(env.VITE_PINECONE_API_KEY),
      'import.meta.env.VITE_PINECONE_ENVIRONMENT': JSON.stringify(env.VITE_PINECONE_ENVIRONMENT),
      'import.meta.env.VITE_PINECONE_INDEX_NAME': JSON.stringify(env.VITE_PINECONE_INDEX_NAME),
      'import.meta.env.VITE_OLLAMA_BASE_URL': JSON.stringify(env.VITE_OLLAMA_BASE_URL),
      'import.meta.env.VITE_CHROMA_CLOUD_TOKEN': JSON.stringify(env.VITE_CHROMA_CLOUD_TOKEN),
      'import.meta.env.VITE_OPENAI_API_KEY': JSON.stringify(env.VITE_OPENAI_API_KEY),
    },
  }
})
