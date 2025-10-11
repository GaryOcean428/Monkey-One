import { createServer, IncomingMessage, ServerResponse } from 'http'
import { createProxyMiddleware } from 'http-proxy-middleware'
import type { Socket } from 'net'

// Create proxy server for Ollama
const ollamaProxy = createProxyMiddleware({
  target: 'http://localhost:11434',
  changeOrigin: true,
  pathRewrite: {
    '^/api/ollama': '/api', // Remove /ollama from path
  },
  on: {
    error: (err: Error, _req: IncomingMessage, res: ServerResponse | Socket) => {
      console.error('Proxy Error:', err)

      if ('writeHead' in res && 'end' in res) {
        res.writeHead(500, {
          'Content-Type': 'application/json',
        })
        res.end(JSON.stringify({ error: 'Proxy Error', message: err.message }))
      }
    },
  },
})

// Create server
const server = createServer((req, res) => {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    res.writeHead(200)
    res.end()
    return
  }

  // Route requests
  if (req.url?.startsWith('/api/ollama')) {
    ollamaProxy(req, res)
  } else if (req.url === '/manifest.json' || req.url === '/site.webmanifest') {
    // Allow access to manifest files without authentication
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    res.setHeader('Access-Control-Allow-Credentials', 'true')
    res.writeHead(200, { 'Content-Type': 'application/manifest+json' })
    res.end(
      JSON.stringify({
        name: 'Monkey One',
        short_name: 'Monkey One',
        icons: [
          {
            src: '/android-chrome-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/android-chrome-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
      })
    )
  } else {
    res.writeHead(404)
    res.end('Not Found')
  }
})

const PORT = process.env.PROXY_PORT || 3004
server.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`)
})
