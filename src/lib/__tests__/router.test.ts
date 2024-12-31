import { expect, describe, it } from 'vitest';
import { AdvancedRouter } from '../router/router';

describe('AdvancedRouter', () => {
  describe('Route Selection', () => {
    const router = new AdvancedRouter();

    it('should use low-tier model for casual queries', () => {
      const config = router.route('Hello, how are you?', []);
      expect(config.model.id).toBe('granite3.1-dense:2b');
    });

    it('should use superior model for complex technical tasks', () => {
      const config = router.route('Design a distributed system for handling millions of concurrent websocket connections', []);
      expect(config.model.id).toBe('o1-2024-12-01');
    });

    it('should use high-tier model for TypeScript questions', () => {
      const config = router.route('Explain TypeScript generic constraints and their implementation', []);
      expect(config.model.id).toBe('claude-3-5-sonnet-v2@20241022');
    });
  });

  describe('Context Analysis', () => {
    const router = new AdvancedRouter();

    it('should identify tech stack correctly', () => {
      const config = router.route('How do I use React hooks with TypeScript?', []);
      expect(config.techStack).toContain('typescript');
      expect(config.techStack).toContain('react');
    });

    it('should assess code complexity accurately', () => {
      const complexQuery = 'Implement a distributed cache with eventual consistency';
      const config = router.route(complexQuery, []);
      expect(config.model.id).toBe('o1-2024-12-01');
    });
  });

  describe('Parameter Adjustment', () => {
    const router = new AdvancedRouter();

    it('should increase temperature for long conversations', () => {
      const history = Array(10).fill({
        role: 'user',
        content: 'test message',
        type: 'message',
        timestamp: Date.now()
      });
      const config = router.route('Next message', history);
      expect(config.temperature).toBeGreaterThan(0.7);
    });
  });
});
