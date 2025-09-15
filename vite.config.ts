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
            // Priority-based chunking: Split largest dependencies first for maximum impact
            
            // Critical ML Libraries (largest impact on bundle size)
            if (id.includes('@tensorflow')) {
              if (id.includes('@tensorflow/tfjs-core')) {
                return 'ml-tensorflow-core' // Core TensorFlow functionality
              }
              if (id.includes('@tensorflow/tfjs-layers')) {
                return 'ml-tensorflow-layers' // High-level layer APIs
              }
              if (id.includes('@tensorflow/tfjs-node')) {
                return 'ml-tensorflow-node' // Node.js backend (often unused in browser)
              }
              return 'ml-tensorflow-base' // Base TensorFlow utilities
            }

            // Transformers library - often very large
            if (id.includes('@xenova/transformers')) {
              return 'ml-transformers' // Separate from TensorFlow for better loading
            }

            // Puppeteer and browser automation (very large, rarely used immediately)
            if (id.includes('puppeteer')) {
              return 'automation-puppeteer'
            }

            // Node modules chunking strategy - optimize for critical rendering path
            if (id.includes('node_modules')) {
              // React ecosystem - keep together for optimal loading
              if (id.includes('react/') || id.includes('scheduler')) {
                return 'framework-react-core'
              }

              // React DOM - separate for SSR flexibility
              if (id.includes('react-dom')) {
                return 'framework-react-dom'
              }

              // React Router - navigation critical
              if (id.includes('react-router')) {
                return 'framework-react-router'
              }

              // State management - core functionality
              if (id.includes('zustand') || id.includes('immer')) {
                return 'framework-state'
              }

              // Data fetching - often critical
              if (id.includes('@tanstack/react-query')) {
                return 'framework-data-fetching'
              }

              // UI component library chunking - group by usage patterns
              if (id.includes('@radix-ui')) {
                // Form and input components - often loaded together
                if (
                  id.includes('@radix-ui/react-form') ||
                  id.includes('@radix-ui/react-select') ||
                  id.includes('@radix-ui/react-checkbox') ||
                  id.includes('@radix-ui/react-radio') ||
                  id.includes('@radix-ui/react-switch') ||
                  id.includes('@radix-ui/react-slider') ||
                  id.includes('@radix-ui/react-progress')
                ) {
                  return 'ui-radix-forms'
                }

                // Overlay components - dialog, popover, modal (often used together)
                if (
                  id.includes('@radix-ui/react-dialog') ||
                  id.includes('@radix-ui/react-popover') ||
                  id.includes('@radix-ui/react-tooltip')
                ) {
                  return 'ui-radix-overlays'
                }

                // Navigation components
                if (
                  id.includes('@radix-ui/react-dropdown-menu') ||
                  id.includes('@radix-ui/react-navigation-menu') ||
                  id.includes('@radix-ui/react-tabs')
                ) {
                  return 'ui-radix-navigation'
                }

                // Feedback components
                if (id.includes('@radix-ui/react-toast') || id.includes('@radix-ui/react-alert')) {
                  return 'ui-radix-feedback'
                }

                // Other Radix components
                return 'ui-radix-misc'
              }

              // Animation and visual effects
              if (id.includes('framer-motion')) {
                return 'ui-animations'
              }

              // Charting libraries - often large and conditionally loaded
              if (id.includes('chart.js')) {
                return 'viz-chart-core'
              }
              if (id.includes('react-chartjs')) {
                return 'viz-chart-react'
              }

              // AI and ML providers - split by provider for better caching
              if (id.includes('openai')) {
                return 'ai-openai'
              }
              if (id.includes('@ai-sdk/openai')) {
                return 'ai-sdk-openai'
              }
              if (id.includes('@huggingface/inference')) {
                return 'ai-huggingface'
              }
              if (id.includes('ai/') && !id.includes('openai')) {
                return 'ai-core'
              }

              // Database and storage
              if (id.includes('@supabase')) {
                if (id.includes('@supabase/auth-helpers')) {
                  return 'db-supabase-auth'
                }
                if (id.includes('@supabase/ssr')) {
                  return 'db-supabase-ssr'
                }
                return 'db-supabase-core'
              }

              // Vector databases
              if (id.includes('@pinecone-database/pinecone')) {
                return 'db-vector-pinecone'
              }

              // Networking and HTTP
              if (
                id.includes('axios') ||
                id.includes('cross-fetch') ||
                id.includes('isomorphic-fetch') ||
                id.includes('undici')
              ) {
                return 'network-http'
              }

              // Utilities and helpers - commonly used
              if (
                id.includes('uuid') ||
                id.includes('debug') ||
                id.includes('clsx') ||
                id.includes('class-variance-authority') ||
                id.includes('tailwind-merge')
              ) {
                return 'utils-common'
              }

              // Date and time utilities
              if (id.includes('date-fns')) {
                return 'utils-date'
              }

              // Form utilities
              if (id.includes('react-hook-form') || id.includes('@hookform/resolvers')) {
                return 'utils-forms'
              }

              // Validation libraries
              if (id.includes('zod') || id.includes('yup')) {
                return 'utils-validation'
              }

              // Monitoring and observability
              if (id.includes('@sentry/browser')) {
                return 'monitoring-sentry'
              }
              if (id.includes('@vercel/analytics')) {
                return 'monitoring-analytics'
              }
              if (id.includes('prom-client')) {
                return 'monitoring-metrics'
              }

              // Development and testing utilities
              if (id.includes('msw') || id.includes('testing-library')) {
                return 'dev-testing'
              }

              // Markdown and content processing
              if (id.includes('marked') || id.includes('highlight.js')) {
                return 'content-markdown'
              }

              // Large icon libraries
              if (id.includes('@heroicons/react') || id.includes('lucide-react')) {
                return 'ui-icons'
              }

              // Other vendor libraries
              return 'vendor-misc'
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
