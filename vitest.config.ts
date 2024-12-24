import { defineConfig } from 'vitest/config';
import path from 'path';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      exclude: [
        'node_modules/',
        'src/setupTests.ts',
        '**/*.d.ts',
        '**/*.test.ts',
        '**/*.test.tsx'
      ]
    },
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    exclude: ['node_modules', 'dist'],
    deps: {
      inline: ['@testing-library/react']
    },
    mockReset: true,
    restoreMocks: true,
    clearMocks: true,
    testTimeout: 20000,
    typecheck: {
      tsconfig: './tsconfig.json',
      include: ['src/**/*.ts', 'src/**/*.tsx']
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
});
