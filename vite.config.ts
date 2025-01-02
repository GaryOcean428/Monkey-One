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
        external: ['events', '@sentry/node', 'pino-pretty', 'winston', 'prom-client'],
      },
      assetsDir: 'assets',
      copyPublicDir: true,
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
      'import.meta.env.VITE_PUBLIC_URL': JSON.stringify(
        env.VITE_PUBLIC_URL || 'http://localhost:3000'
      ),
    },
  }
})
