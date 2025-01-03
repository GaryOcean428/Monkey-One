import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'
import path from 'path'

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      react({
        jsxRuntime: 'automatic',
        fastRefresh: true,
      }),
      visualizer({
        filename: 'stats.html',
        open: true,
        gzipSize: true,
        brotliSize: true,
      }),
    ],
    server: {
      port: 4000,
      host: true,
      watch: {
        usePolling: true,
      },
      proxy: {
        '/icons': {
          target: 'https://s1.npass.app',
          changeOrigin: true,
          secure: true,
          headers: {
            'Access-Control-Allow-Origin': '*',
          },
        },
      },
      cors: true,
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      sourcemap: true,
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom'],
            'ui-components': ['./src/components/ui/tooltip'],
          },
        },
      },
    },
    define: {
      __DEV__: command !== 'build',
      'process.env': {
        VITE_SUPABASE_URL: JSON.stringify(env.VITE_SUPABASE_URL),
        VITE_SUPABASE_ANON_KEY: JSON.stringify(env.VITE_SUPABASE_ANON_KEY),
        VITE_PUBLIC_URL: JSON.stringify(env.VITE_PUBLIC_URL || 'http://localhost:4002'),
      },
    },
  }
})
