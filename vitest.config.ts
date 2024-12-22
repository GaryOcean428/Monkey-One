import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true, // This allows using describe, it, etc. without imports
    environment: 'jsdom',
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    setupFiles: ['./src/setupTests.ts'], // If you need a setup file
    deps: {
      inline: ['vitest-canvas-mock'] // If you need canvas mocking
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/**', 'dist/**']
    }
  }
})
