import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import compression from 'vite-plugin-compression'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import tsconfigPaths from 'vite-tsconfig-paths'
import { visualizer } from 'rollup-plugin-visualizer'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on mode
  const env = loadEnv(mode, __dirname, '')

  return {
    plugins: [
      react({
        // Improve React bundle size by enabling babel optimizations
        babel: {
          plugins: [['@babel/plugin-transform-react-jsx', { runtime: 'automatic' }]],
        },
      }),
      tsconfigPaths(),
      compression({
        algorithm: 'gzip',
        ext: '.gz',
      }),
      compression({
        algorithm: 'brotliCompress',
        ext: '.br',
      }),
      visualizer({
        filename: 'stats.html',
        open: false, // Don't open stats automatically in production
        gzipSize: true,
        brotliSize: true,
        template: 'treemap', // Use treemap for better visualization
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
      minify: 'esbuild',
      cssMinify: true,
      cssCodeSplit: true,
      modulePreload: {
        polyfill: true,
      },
      // Target modern browsers for smaller bundles
      target: 'es2020',
      // Don't chunk modules smaller than 10kb
      assetsInlineLimit: 10000,
      // Improve code splitting efficiency
      chunkSizeWarningLimit: 1200,
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
        },
        output: {
          // Avoid emitting empty chunks
          compact: true,
          // Improve tree-shaking
          preserveModules: false,
          // Dedupe and minimize code
          generatedCode: {
            preset: 'es2020',
            constBindings: true,
            objectShorthand: true,
          },
          manualChunks: id => {
            // Focus on the largest dependencies first - these are most likely causing the large index chunk

            // TensorFlow - these are very large
            if (id.includes('@tensorflow')) {
              if (id.includes('@tensorflow/tfjs-core')) {
                return 'tensorflow-core'
              }
              if (id.includes('@tensorflow/tfjs-layers')) {
                return 'tensorflow-layers'
              }
              if (id.includes('@tensorflow/tfjs-node')) {
                return 'tensorflow-node'
              }
              return 'tensorflow'
            }

            // Transformers library
            if (id.includes('@xenova/transformers')) {
              return 'transformers'
            }

            // Node modules chunking strategy - more granular
            if (id.includes('node_modules')) {
              // React core
              if (id.includes('react/') || id.includes('scheduler')) {
                return 'react-core'
              }

              // React DOM
              if (id.includes('react-dom')) {
                return 'react-dom'
              }

              // React Router
              if (id.includes('react-router')) {
                return 'react-router'
              }

              // Tanstack Query
              if (id.includes('@tanstack/react-query')) {
                return 'tanstack-query'
              }

              // Radix UI - split by component type
              if (
                id.includes('@radix-ui/react-dialog') ||
                id.includes('@radix-ui/react-popover') ||
                id.includes('@radix-ui/react-modal')
              ) {
                return 'radix-overlays'
              }

              if (
                id.includes('@radix-ui/react-dropdown-menu') ||
                id.includes('@radix-ui/react-navigation-menu') ||
                id.includes('@radix-ui/react-tabs')
              ) {
                return 'radix-navigation'
              }

              if (id.includes('@radix-ui/react-tooltip') || id.includes('@radix-ui/react-toast')) {
                return 'radix-feedback'
              }

              if (
                id.includes('@radix-ui/react-form') ||
                id.includes('@radix-ui/react-select') ||
                id.includes('@radix-ui/react-checkbox') ||
                id.includes('@radix-ui/react-radio') ||
                id.includes('@radix-ui/react-switch')
              ) {
                return 'radix-inputs'
              }

              // Other Radix components
              if (id.includes('@radix-ui')) {
                return 'radix-other'
              }

              // Animation libraries
              if (id.includes('framer-motion')) {
                return 'animation-libs'
              }

              // AI core libraries
              if (id.includes('ai/') || id.includes('@ai-sdk')) {
                return 'ai-core'
              }

              // LLM providers
              if (id.includes('openai') || id.includes('anthropic') || id.includes('huggingface')) {
                return 'llm-providers'
              }

              // Vector databases
              if (id.includes('pinecone') || id.includes('chroma') || id.includes('weaviate')) {
                return 'vector-dbs'
              }

              // Tensorflow and ML libraries
              if (id.includes('@tensorflow') || id.includes('@xenova/transformers')) {
                return 'ml-libs'
              }

              // Charting core
              if (id.includes('chart.js')) {
                return 'chart-core'
              }

              // Chart components
              if (id.includes('react-chartjs')) {
                return 'chart-components'
              }

              // State management
              if (id.includes('zustand') || id.includes('immer')) {
                return 'state-management'
              }

              // Form libraries
              if (id.includes('react-hook-form') || id.includes('@hookform/resolvers')) {
                return 'form-libs'
              }

              // Validation libraries
              if (id.includes('zod') || id.includes('yup') || id.includes('validator')) {
                return 'validation-libs'
              }

              // HTTP and networking
              if (
                id.includes('axios') ||
                id.includes('cross-fetch') ||
                id.includes('isomorphic-fetch') ||
                id.includes('undici')
              ) {
                return 'http-libs'
              }

              // Date libraries
              if (id.includes('date-fns')) {
                return 'date-libs'
              }

              // Utility libraries
              if (
                id.includes('uuid') ||
                id.includes('lodash') ||
                id.includes('debug') ||
                id.includes('clsx') ||
                id.includes('class-variance-authority') ||
                id.includes('tailwind-merge')
              ) {
                return 'utils-libs'
              }

              // Supabase
              if (id.includes('@supabase')) {
                return 'supabase'
              }

              // Monitoring and analytics
              if (
                id.includes('@sentry') ||
                id.includes('@vercel/analytics') ||
                id.includes('prom-client')
              ) {
                return 'monitoring'
              }

              // Markdown and syntax highlighting
              if (id.includes('marked') || id.includes('highlight.js')) {
                return 'markdown-libs'
              }

              // Other third-party libraries
              return 'vendor'
            }

            // Application code chunking strategy - more specific
            if (id.includes('/src/')) {
              // Main app and entry points
              if (
                id.includes('/src/main.tsx') ||
                id.includes('/src/App.tsx') ||
                id.includes('/src/routes.tsx')
              ) {
                return 'app-core'
              }

              // UI components by type
              if (id.includes('/components/ui/')) {
                if (
                  id.includes('button') ||
                  id.includes('input') ||
                  id.includes('form') ||
                  id.includes('select') ||
                  id.includes('checkbox') ||
                  id.includes('switch')
                ) {
                  return 'ui-input-components'
                }

                if (id.includes('dialog') || id.includes('modal') || id.includes('popover')) {
                  return 'ui-overlay-components'
                }

                if (id.includes('toast') || id.includes('alert') || id.includes('notification')) {
                  return 'ui-feedback-components'
                }

                return 'ui-components'
              }

              // Feature components
              if (id.includes('/components/')) {
                if (id.includes('/agents/') || id.includes('/brain/')) {
                  return 'agent-components'
                }

                if (id.includes('/chat/')) {
                  return 'chat-components'
                }

                if (id.includes('/panels/')) {
                  return 'panel-components'
                }

                if (id.includes('/auth/')) {
                  return 'auth-components'
                }

                return 'components'
              }

              // Pages by feature
              if (id.includes('/pages/')) {
                if (id.includes('/Auth/')) {
                  return 'auth-pages'
                }

                return 'pages'
              }

              // Lib code by domain
              if (id.includes('/lib/')) {
                if (id.includes('/agents/')) {
                  return 'agent-lib'
                }

                if (id.includes('/tools/')) {
                  return 'tools-lib'
                }

                if (id.includes('/memory/') || id.includes('/vector')) {
                  return 'memory-lib'
                }

                if (id.includes('/llm/') || id.includes('/ai/')) {
                  return 'ai-lib'
                }

                if (id.includes('/core/')) {
                  return 'core-lib'
                }

                if (id.includes('/monitoring/') || id.includes('/analytics/')) {
                  return 'monitoring-lib'
                }

                if (id.includes('/utils/') || id.includes('/helpers/')) {
                  return 'utils-lib'
                }

                return 'lib'
              }

              // Stores
              if (id.includes('/store/') || id.includes('/stores/')) {
                return 'stores'
              }

              // Providers
              if (id.includes('/providers/')) {
                return 'providers'
              }

              // Hooks
              if (id.includes('/hooks/')) {
                return 'hooks'
              }

              // Contexts
              if (id.includes('/contexts/')) {
                return 'contexts'
              }

              // Tests
              if (id.includes('/__tests__/') || id.includes('.test.')) {
                return 'tests'
              }
            }

            // Default chunk
            return null
          },
          // These settings help balance chunk size and number of requests
          chunkSizeWarningLimit: 1000, // Temporarily increase for clearer focus on critical chunks
          entryFileNames: 'assets/[name]-[hash].js',
          chunkFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]',
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
