import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'
import path from 'path'
import dotenv from 'dotenv'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import terser from '@rollup/plugin-terser'
import { visualizer } from 'rollup-plugin-visualizer'
import compression from 'vite-plugin-compression'

dotenv.config()

const __filename = fileURLToPath(new URL(import.meta.url))
const __dirname = dirname(__filename)

export default defineConfig({
  plugins: [
    react(),
    nodeResolve(),
    commonjs(),
    compression({
      algorithm: 'brotli',
      ext: '.br'
    }),
    process.env.ANALYZE && visualizer({
      filename: './dist/stats.html',
      open: true,
      gzipSize: true,
      brotliSize: true
    })
  ],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  build: {
    target: 'es2015',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'firebase-vendor': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-select'],
          'ml-vendor': ['@tensorflow/tfjs', '@huggingface/inference']
        }
      },
      plugins: [
        terser({
          format: {
            comments: false
          }
        })
      ]
    },
    sourcemap: true,
    chunkSizeWarningLimit: 1000
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'firebase/app']
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts'],
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: [
        'node_modules/',
        'src/setupTests.ts',
      ],
    },
  },
})
