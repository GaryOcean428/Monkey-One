import { createServer } from 'http';
import { createProxyMiddleware } from 'http-proxy-middleware';

// Create proxy server for Ollama
const ollamaProxy = createProxyMiddleware({
  target: 'http://localhost:11434',
  changeOrigin: true,
  pathRewrite: {
    '^/api/ollama': '/api', // Remove /ollama from path
  },
  onError: (err, req, res) => {
    console.error('Proxy Error:', err);
    res.writeHead(500, {
      'Content-Type': 'application/json',
    });
    res.end(JSON.stringify({ error: 'Proxy Error', message: err.message }));
  },
});

// Create server
const server = createServer((req, res) => {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Route requests
  if (req.url?.startsWith('/api/ollama')) {
    ollamaProxy(req, res);
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

const PORT = process.env.PROXY_PORT || 3001;
server.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});
