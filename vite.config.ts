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
    optimizeDeps: {
      include: [
        '@radix-ui/react-slider',
        '@radix-ui/react-tabs',
        '@radix-ui/react-switch',
        '@radix-ui/react-select'
      ]
    },
    resolve: {
      alias: [
        { find: '@', replacement: resolve(__dirname, './src') },
        { find: '~', replacement: resolve(__dirname, './') },
      ],
    },
    define: {
      global: 'globalThis',
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY),
      'import.meta.env.VITE_OPENAI_API_KEY': JSON.stringify(env.NEXT_PUBLIC_OPENAI_API_KEY),
      'import.meta.env.VITE_PINECONE_API_KEY': JSON.stringify(env.VITE_PINECONE_API_KEY),
      'import.meta.env.VITE_PINECONE_ENVIRONMENT': JSON.stringify(env.VITE_PINECONE_ENVIRONMENT),
    },
    build: {
      outDir: 'dist',
      sourcemap: true,
      target: 'esnext',
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
        },
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('@radix-ui')) {
                return 'vendor-radix';
              }
              if (id.includes('react')) {
                return 'vendor-react';
              }
              return 'vendor';
            }
            if (id.includes('src/components/ui')) {
              return 'ui';
            }
            if (id.includes('src/components/panels')) {
              return 'panels';
            }
            if (id.includes('src/components/chat')) {
              return 'chat';
            }
            if (id.includes('src/store')) {
              return 'store';
            }
            if (id.includes('src/lib')) {
              return 'lib';
            }
          }
        }
      },
      chunkSizeWarningLimit: 1000
    },
    server: {
      proxy: {
        '/api/ollama': {
          target: 'http://localhost:3001',
          changeOrigin: true,
          secure: false,
        },
      },
      port: 3000,
      open: true,
      cors: true,
      force: true // Force the server to re-bundle on startup
    }
  };
});
