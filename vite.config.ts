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
    optimizeDeps: {
      include: ['onnxruntime-web'],
      esbuildOptions: {
        target: 'esnext',
      },
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
          manualChunks: {
            'react-vendor': ['react', 'react-dom'],
            'onnx-vendor': ['onnxruntime-web'],
          },
        },
      },
    },
    server: {
      port: 3000,
      host: true,
      cors: true,
      hmr: {
        overlay: false,
        clientPort: 3000,
      },
      watch: {
        usePolling: true,
        interval: 100,
      },
      proxy: {
        '/api/ollama': {
          target: 'http://localhost:3001',
          changeOrigin: true,
          secure: false,
        },
      },
    },
    preview: {
      port: 3000,
      host: true
    }
  };
});
