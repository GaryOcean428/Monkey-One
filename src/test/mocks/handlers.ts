import { http, HttpResponse } from 'msw'

// Mock Redis operations
const mockRedisData = new Map<string, string>()

export const handlers = [
  // Redis GET
  http.get('/redis/:key', ({ params }) => {
    const key = params.key as string
    const value = mockRedisData.get(key)

    if (!value) {
      return new HttpResponse(null, { status: 404 })
    }

    return HttpResponse.json({ value })
  }),

  // Redis SET
  http.post('/redis', async ({ request }) => {
    const body = (await request.json()) as { key: string; value: string }
    mockRedisData.set(body.key, body.value)
    return new HttpResponse(null, { status: 200 })
  }),

  // Agent API
  http.post('/api/agents', async ({ request }) => {
    const body = (await request.json()) as {
      name: string
      type: string
      capabilities: string[]
    }

    return HttpResponse.json({
      id: 'test-agent-id',
      name: body.name,
      type: body.type,
      capabilities: body.capabilities,
      status: 'idle',
      createdAt: new Date().toISOString(),
    })
  }),

  // Monitoring API
  http.post('/api/metrics', () => {
    return new HttpResponse(null, { status: 200 })
  }),

  // Cache API
  http.get('/api/cache/:key', ({ params }) => {
    const key = params.key as string
    return HttpResponse.json({
      key,
      value: `cached-value-${key}`,
      timestamp: Date.now(),
    })
  }),

  // Neural Network API
  http.post('/api/ml/predict', () => {
    return HttpResponse.json({
      prediction: Math.random(),
      confidence: Math.random(),
      latency: Math.floor(Math.random() * 100),
    })
  }),
]
