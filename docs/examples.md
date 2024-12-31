# Usage Examples

## Database Operations

### Basic CRUD Operations

```typescript
import { db } from '@/lib/database/DatabaseService';

// Create
const profile = await db.create('profiles', {
  user_id: userId,
  username: 'johndoe',
  avatar_url: 'https://example.com/avatar.jpg'
});

// Read
const user = await db.read('profiles', profile.id);

// Update
const updated = await db.update('profiles', profile.id, {
  username: 'janedoe'
});

// Delete
await db.delete('profiles', profile.id);
```

### Complex Queries

```typescript
// Query with filters and sorting
const activeUsers = await db.query('profiles', {
  select: 'id, username, avatar_url',
  eq: { status: 'active' },
  order: { created_at: 'desc' },
  limit: 10
});

// Join queries
const usersWithPosts = await db.query('profiles', {
  select: '*, posts(*)',
  eq: { status: 'active' },
  order: { 'posts.created_at': 'desc' }
});

// Full-text search
const searchResults = await db.search('posts', 'typescript react', {
  select: 'id, title, content',
  limit: 20
});
```

## Caching Strategies

### LRU Cache

```typescript
import { LRUCache } from '@/lib/cache/strategies';

const cache = new LRUCache('userProfiles', 1000);

// Cache expensive operations
async function getUserProfile(id: string) {
  const cached = await cache.get(id);
  if (cached) return cached;

  const profile = await db.read('profiles', id);
  await cache.set(id, profile);
  return profile;
}
```

### Sliding Window Cache

```typescript
import { SlidingWindowCache } from '@/lib/cache/strategies';

const cache = new SlidingWindowCache('apiRequests', 3600);

// Rate limiting
async function checkRateLimit(userId: string): Promise<boolean> {
  const pattern = await cache.getAccessPattern(userId);
  const requestsInLastHour = pattern.length;
  
  if (requestsInLastHour >= 1000) {
    return false;
  }

  await cache.set(userId, Date.now());
  return true;
}
```

### Tiered Cache

```typescript
import { TieredCache } from '@/lib/cache/strategies';

const cache = new TieredCache('content', [
  { name: 'memory', ttl: 300, maxSize: 1000 },
  { name: 'redis', ttl: 3600, maxSize: 10000 }
]);

// Content caching
async function getContent(id: string) {
  const cached = await cache.get(id);
  if (cached) return cached;

  const content = await fetchContent(id);
  await cache.set(id, content);
  return content;
}
```

### Prefetch Cache

```typescript
import { PrefetchCache } from '@/lib/cache/strategies';

const rules = [{
  pattern: /user:\d+/,
  related: async (key: string) => {
    const userId = key.split(':')[1];
    return [
      `profile:${userId}`,
      `preferences:${userId}`,
      `notifications:${userId}`
    ];
  }
}];

const cache = new PrefetchCache('user', rules);

// Smart prefetching
async function getUserData(userId: string) {
  const key = `user:${userId}`;
  const cached = await cache.get(key);
  if (cached) return cached;

  // This will trigger prefetch of related data
  const userData = await fetchUserData(userId);
  await cache.set(key, userData);
  return userData;
}
```

## Monitoring and Logging

### Performance Monitoring

```typescript
import { monitoring } from '@/lib/monitoring/MonitoringService';

// Track operation duration
async function performOperation() {
  const start = Date.now();
  try {
    await someExpensiveOperation();
  } finally {
    await monitoring.recordOperationDuration(
      'expensive_op',
      Date.now() - start,
      { type: 'computation' }
    );
  }
}

// Monitor cache effectiveness
async function getCachedData(key: string) {
  const start = Date.now();
  const cached = await cache.get(key);
  
  if (cached) {
    await monitoring.recordCacheOperation('hit', Date.now() - start);
    return cached;
  }

  await monitoring.recordCacheOperation('miss', Date.now() - start);
  return fetchFreshData();
}
```

### Error Tracking

```typescript
import { monitoring } from '@/lib/monitoring/MonitoringService';

// Log errors with context
try {
  await riskyOperation();
} catch (error) {
  await monitoring.recordError('riskyOperation', error);
  throw error;
}

// Log with metadata
await monitoring.log('warn', 'Rate limit approaching', {
  user_id: userId,
  current_rate: 950,
  limit: 1000
});
```

### Health Monitoring

```typescript
import { monitoring } from '@/lib/monitoring/MonitoringService';

// Regular health checks
async function checkSystemHealth() {
  const health = await monitoring.checkHealth();
  
  if (health.status !== 'healthy') {
    await monitoring.log('error', 'System degraded', {
      status: health.status,
      checks: health.checks
    });
  }

  return health;
}

// Monitor specific components
async function monitorDatabaseHealth() {
  const start = Date.now();
  try {
    await db.query('health_check');
    await monitoring.recordMetric('database_health', 1, {
      latency: Date.now() - start
    });
  } catch (error) {
    await monitoring.recordMetric('database_health', 0, {
      error: error.message
    });
    throw error;
  }
}
```

## Best Practices

1. **Error Handling**
   - Always wrap operations in try-catch
   - Log errors with context
   - Use appropriate error types
   - Implement retry mechanisms

2. **Performance**
   - Use appropriate cache strategy
   - Monitor operation durations
   - Implement rate limiting
   - Use batch operations

3. **Monitoring**
   - Track key metrics
   - Set up alerts
   - Monitor cache effectiveness
   - Check system health regularly

4. **Security**
   - Validate input
   - Use proper authentication
   - Implement rate limiting
   - Monitor for suspicious activity
