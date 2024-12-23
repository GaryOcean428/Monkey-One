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

// Define chunks for code splitting
const manualChunks = {
  'vendor-react': ['react', 'react-dom', 'react-router-dom'],
  'vendor-firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
  'vendor-ui': ['@radix-ui/react-alert-dialog', '@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
  'vendor-ml': ['@tensorflow/tfjs', '@tensorflow/tfjs-core'],
  'vendor-editor': ['@monaco-editor/react']
};

export default defineConfig({
  plugins: [
    react({
      fastRefresh: true,
      babel: {
        plugins: [
          ['@babel/plugin-transform-runtime'],
          ['babel-plugin-import', { libraryName: 'antd', style: true }]
        ]
      }
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
  build: {
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    rollupOptions: {
      output: {
        manualChunks,
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]'
      }
    },
    sourcemap: false,
    chunkSizeWarningLimit: 1000
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@containers': path.resolve(__dirname, './src/containers'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@assets': path.resolve(__dirname, './src/assets'),
      '@styles': path.resolve(__dirname, './src/styles'),
      '@services': path.resolve(__dirname, './src/services'),
      '@types': path.resolve(__dirname, './src/types'),
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
    exclude: ['@tensorflow/tfjs']
  }
});
