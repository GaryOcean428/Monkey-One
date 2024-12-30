import { describe, it, expect, beforeEach } from 'vitest';
import { LRUCache, SlidingWindowCache, TieredCache, PrefetchCache } from '../../lib/cache/strategies';
import { sleep } from '../../lib/utils';

describe('Cache Strategies Integration Tests', () => {
  describe('LRU Cache', () => {
    const lru = new LRUCache('test', 3);

    beforeEach(async () => {
      await lru.clear();
    });

    it('should maintain max size', async () => {
      await lru.set('key1', 'value1');
      await lru.set('key2', 'value2');
      await lru.set('key3', 'value3');
      await lru.set('key4', 'value4');

      expect(await lru.get('key1')).toBeNull(); // Evicted
      expect(await lru.get('key4')).toBe('value4');
    });

    it('should update access order', async () => {
      await lru.set('key1', 'value1');
      await lru.set('key2', 'value2');
      await lru.set('key3', 'value3');

      // Access key1, making it most recently used
      await lru.get('key1');
      await lru.set('key4', 'value4');

      expect(await lru.get('key2')).toBeNull(); // Evicted
      expect(await lru.get('key1')).toBe('value1');
    });
  });

  describe('Sliding Window Cache', () => {
    const sliding = new SlidingWindowCache('test', 2);

    beforeEach(async () => {
      await sliding.clear();
    });

    it('should track access patterns', async () => {
      await sliding.set('key1', 'value1');
      await sleep(100);
      await sliding.get('key1');
      await sleep(100);
      await sliding.get('key1');

      const pattern = await sliding.getAccessPattern('key1');
      expect(pattern).toHaveLength(3);
    });

    it('should expire items after window', async () => {
      await sliding.set('key1', 'value1');
      await sleep(2100); // Wait for window to expire
      expect(await sliding.get('key1')).toBeNull();
    });
  });

  describe('Tiered Cache', () => {
    const tiered = new TieredCache('test', [
      { name: 'l1', ttl: 60, maxSize: 2 },
      { name: 'l2', ttl: 300, maxSize: 5 }
    ]);

    beforeEach(async () => {
      await tiered.clear();
    });

    it('should promote frequently accessed items', async () => {
      await tiered.set('key1', 'value1');
      
      // Access multiple times
      await tiered.get('key1');
      await tiered.get('key1');
      await tiered.get('key1');

      const stats = await tiered.getTierStats();
      expect(stats.l2.size).toBe(1); // Promoted to L2
    });

    it('should handle tier overflow', async () => {
      await tiered.set('key1', 'value1');
      await tiered.set('key2', 'value2');
      await tiered.set('key3', 'value3');

      const stats = await tiered.getTierStats();
      expect(stats.l1.size).toBe(1);
      expect(stats.l2.size).toBe(2);
    });
  });

  describe('Prefetch Cache', () => {
    const rules = [{
      pattern: /user:\d+/,
      related: async (key: string) => {
        const userId = key.split(':')[1];
        return [
          `profile:${userId}`,
          `settings:${userId}`
        ];
      }
    }];

    const prefetch = new PrefetchCache('test', rules);

    beforeEach(async () => {
      await prefetch.clear();
    });

    it('should prefetch related items', async () => {
      // Set up test data
      await prefetch.set('user:123', { id: '123', name: 'Test' });
      await prefetch.set('profile:123', { avatar: 'test.jpg' });
      await prefetch.set('settings:123', { theme: 'dark' });

      // Access user data (triggers prefetch)
      await prefetch.get('user:123');
      await sleep(100); // Wait for prefetch

      // Check prefetch stats
      const stats = await prefetch.getPrefetchStats('profile:123');
      expect(stats?.prefetchCount).toBeGreaterThan(0);
    });

    it('should track prefetch effectiveness', async () => {
      await prefetch.set('user:123', { id: '123', name: 'Test' });
      
      // Multiple accesses
      await prefetch.get('user:123');
      await sleep(100);
      await prefetch.get('user:123');

      const stats = await prefetch.getPrefetchStats('user:123');
      expect(stats?.prefetchCount).toBeGreaterThan(1);
    });
  });
});
