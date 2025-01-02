import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['**/node_modules/**', '**/dist/**'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'src/setupTests.ts', 'src/**/*.d.ts', 'src/types/**'],
      thresholds: {
        statements: 80,
        branches: 75,
        functions: 80,
        lines: 80,
      },
    },
    testTimeout: 20000,
    hookTimeout: 20000,
    pool: 'forks', // Use process isolation for tests
    poolOptions: {
      threads: {
        singleThread: false,
      },
      forks: {
        isolate: true,
      },
    },
    retry: 2,
    maxConcurrency: 10,
    sequence: {
      shuffle: true, // Randomize test order
    },
    environmentOptions: {
      jsdom: {
        resources: 'usable',
      },
    },
    mockReset: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@test': path.resolve(__dirname, './src/__tests__'),
    },
  },
})
