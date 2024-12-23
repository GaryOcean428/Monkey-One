import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import dotenv from 'dotenv';
import compression from 'vite-plugin-compression';

// Load environment variables
dotenv.config();
dotenv.config({ path: '.env.local' });

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on mode
  const env = loadEnv(mode, process.cwd(), '');

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
    define: {
      global: 'globalThis',
      // Expose env variables
      'import.meta.env.VITE_OPENAI_API_KEY': JSON.stringify(env.NEXT_PUBLIC_OPENAI_API_KEY),
      'import.meta.env.VITE_PINECONE_API_KEY': JSON.stringify(env.VITE_PINECONE_API_KEY),
      'import.meta.env.VITE_PINECONE_ENVIRONMENT': JSON.stringify(env.VITE_PINECONE_ENVIRONMENT),
    },
    build: {
      outDir: 'dist',
      sourcemap: true,
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom'],
            'firebase-vendor': [
              'firebase/app',
              'firebase/auth',
              'firebase/firestore',
              'firebase/storage',
              'firebase/database'
            ],
            'ui-vendor': [
              '@radix-ui/react-alert-dialog',
              '@radix-ui/react-dialog',
              '@radix-ui/react-dropdown-menu',
              '@radix-ui/react-select',
              '@radix-ui/react-slider',
              '@radix-ui/react-slot',
              '@radix-ui/react-switch',
              '@radix-ui/react-tabs',
              '@radix-ui/react-tooltip'
            ]
          }
        }
      },
      chunkSizeWarningLimit: 1000
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, './src')
      }
    },
    server: {
      port: 3000,
      host: true,
      hmr: {
        overlay: true,
        clientPort: 3000,
      },
      watch: {
        usePolling: true,
        interval: 100,
      },
    },
    preview: {
      port: 3000,
      host: true
    }
  };
});
