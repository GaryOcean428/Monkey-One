import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    // Add explicit port configuration
    port: 5173,
    strictPort: true,
    // Add WebSocket configuration
    hmr: {
      port: 5173
    },
    proxy: {
      '/api': {
        target: process.env.VITE_API_ENDPOINT || 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    },
    cors: {
      origin: true,
      credentials: true
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'ui-vendor': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-select',
            '@radix-ui/react-tabs',
            '@radix-ui/react-tooltip'
          ],
          'utils-vendor': ['zustand', 'clsx', 'tailwind-merge']
        }
      }
    }
  },
  optimizeDeps: {
    exclude: ['@tensorflow/tfjs-node']
  },
  clearScreen: false,
  cacheDir: '.vite'
});