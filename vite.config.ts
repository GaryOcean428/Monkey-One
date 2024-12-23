import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import path from 'path';
import dotenv from 'dotenv';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import { visualizer } from 'rollup-plugin-visualizer';
import compression from 'vite-plugin-compression';
import tsconfigPaths from 'vite-tsconfig-paths';

dotenv.config();

const __filename = fileURLToPath(new URL(import.meta.url));
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [
    react({
      fastRefresh: true
    }),
    tsconfigPaths(),
    nodeResolve({
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
      preferBuiltins: true
    }),
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
  ].filter(Boolean),
  resolve: {
    alias: [
      { find: '@', replacement: path.resolve(__dirname, 'src') },
      { find: '@components', replacement: path.resolve(__dirname, 'src/components') },
      { find: '@containers', replacement: path.resolve(__dirname, 'src/containers') },
      { find: '@utils', replacement: path.resolve(__dirname, 'src/utils') },
      { find: '@hooks', replacement: path.resolve(__dirname, 'src/hooks') },
      { find: '@assets', replacement: path.resolve(__dirname, 'src/assets') },
      { find: '@styles', replacement: path.resolve(__dirname, 'src/styles') },
      { find: '@services', replacement: path.resolve(__dirname, 'src/services') },
      { find: '@types', replacement: path.resolve(__dirname, 'src/types') },
      { find: '@store', replacement: path.resolve(__dirname, 'src/store') },
      { find: '@lib', replacement: path.resolve(__dirname, 'src/lib') }
    ],
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json']
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
      input: {
        main: path.resolve(__dirname, 'index.html')
      },
      external: [],
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
    include: [
      'react',
      'react-dom',
      'firebase/app',
      '@radix-ui/react-tooltip',
      'clsx',
      'tailwind-merge'
    ],
    esbuildOptions: {
      resolveExtensions: ['.js', '.jsx', '.ts', '.tsx']
    }
  },
  server: {
    hmr: true,
    watch: {
      usePolling: true,
      interval: 100
    },
    overlay: true,
    port: 3000,
    host: true
  }
});
