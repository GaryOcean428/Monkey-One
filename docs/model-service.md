# Model Service Documentation

## Overview

The Model Service provides a unified interface for interacting with various language models, both local and cloud-based. It includes features like streaming responses, rate limiting, caching, and comprehensive monitoring.

## Features

- Multi-model support (GPT-4, Claude, Phi-3.5, etc.)
- Streaming responses
- Automatic rate limiting
- Response caching
- Performance monitoring
- Analytics tracking
- Fallback handling

## Basic Usage

### Regular Response Generation

```typescript
import { generateResponse } from '../lib/models';

// Using default model (Phi-3.5)
const response = await generateResponse('Your prompt here');

// Using specific model with options
const response = await generateResponse('Your prompt', 'claude-3.5-sonnet', {
  temperature: 0.7,
  maxTokens: 2000,
  cacheResponse: true
});
```

### Streaming Responses

```typescript
import { generateStreamingResponse } from '../lib/models';

// Using the streaming API
for await (const chunk of generateStreamingResponse('Your prompt', 'gpt-4o')) {
  console.log(chunk.text);
  if (chunk.done) break;
}

// Using the StreamingResponse component
import { StreamingResponse } from '../components/StreamingResponse';

function MyComponent() {
  return (
    <StreamingResponse
      prompt="Your prompt"
      modelName="gpt-4o"
      options={{ temperature: 0.7 }}
      onComplete={(response) => console.log('Final response:', response)}
    />
  );
}
```

### Analytics & Monitoring

```typescript
import { useMonitoring } from '../hooks/useMonitoring';
import { ModelMetricsChart } from '../components/analytics/ModelMetricsChart';

function AnalyticsDashboard() {
  const { logEvent, getMetrics } = useMonitoring();

  // Track custom events
  useEffect(() => {
    logEvent('pageView', {
      page: 'analytics',
      timestamp: Date.now()
    });
  }, []);

  return (
    <div>
      <ModelMetricsChart modelName="gpt-4o" />
      <pre>{JSON.stringify(getMetrics('gpt-4o'), null, 2)}</pre>
    </div>
  );
}
```

## Configuration

### Environment Variables

```env
VITE_OPENAI_API_KEY=your_openai_key
VITE_ANTHROPIC_API_KEY=your_anthropic_key
VITE_GROQ_API_KEY=your_groq_key
VITE_PERPLEXITY_API_KEY=your_perplexity_key
VITE_QWEN_API_KEY=your_qwen_key
```

### Rate Limits

Default rate limits per provider:
- OpenAI: 60 requests/minute
- Anthropic: 50 requests/minute
- Perplexity: 40 requests/minute
- Groq: 45 requests/minute
- Qwen: 30 requests/minute
- Local: 120 requests/minute

### Cache Configuration

Default cache settings:
- TTL: 1 hour
- Max size: 1000 entries
- LRU eviction policy

## Performance Monitoring

The service tracks various performance metrics:
- Request latency (p50, p90, p99)
- Token processing speed
- Memory usage
- Error rates
- Cache hit rates

View these metrics using the `ModelMetricsChart` component or the monitoring hooks.

## Error Handling

The service includes comprehensive error handling:
- Automatic fallback to backup models
- Rate limit handling
- Token limit validation
- Network error recovery
- Timeout handling

## Testing

### Unit Tests
```bash
npm run test
```

### E2E Tests
```bash
npm run test:e2e
```

## Best Practices

1. Always handle streaming cleanup:
```typescript
useEffect(() => {
  const controller = new AbortController();
  // ... streaming logic ...
  return () => controller.abort();
}, []);
```

2. Use appropriate error boundaries:
```typescript
<ErrorBoundary fallback={<ErrorMessage />}>
  <StreamingResponse prompt={prompt} />
</ErrorBoundary>
```

3. Implement proper loading states:
```typescript
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<Error | null>(null);

// ... handle states appropriately ...
```

4. Monitor performance metrics:
```typescript
const { getMetrics } = useMonitoring();
const metrics = getMetrics('your-model');
if (metrics.errorRate > 0.1) {
  // Handle high error rate
}
```

## Support

For issues and feature requests, please file an issue in the repository.
