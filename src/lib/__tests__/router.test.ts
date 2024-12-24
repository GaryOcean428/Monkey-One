import { describe, it, expect, beforeEach } from 'vitest';
import { AdvancedRouter } from '../router';
import { TokenEstimator } from '../tokenEstimator';
import { XAIMessage } from '../types';

describe('AdvancedRouter', () => {
  let router: AdvancedRouter;

  beforeEach(() => {
    router = new AdvancedRouter(0.5);
  });

  describe('Route Selection', () => {
    it('should use low-tier model for casual queries', () => {
      const query = 'Hi there!';
      const result = router.route(query, []);
      expect(result.model.id).toBe('llama3-groq-8b');
      expect(result.maxTokens).toBe(50);
    });

    it('should use superior model for complex technical tasks', () => {
      const query = 'Design a scalable microservices architecture using TypeScript, React, and GraphQL';
      const result = router.route(query, []);
      expect(result.model.id).toBe('grok-2');
      expect(result.maxTokens).toBeGreaterThan(1024);
    });

    it('should use high-tier model for TypeScript questions', () => {
      const query = 'How do I implement a generic type guard?';
      const result = router.route(query, []);
      expect(result.model.id).toBe('llama-3.3-70b');
    });
  });

  describe('Context Analysis', () => {
    it('should identify tech stack correctly', () => {
      const query = 'Debug this React component with TypeScript';
      const result = router.route(query, []);
      expect(result.routingExplanation).toContain('react');
      expect(result.routingExplanation).toContain('typescript');
    });

    it('should assess code complexity accurately', () => {
      const query = 'Implement a balanced binary search tree with TypeScript';
      const result = router.route(query, []);
      expect(result.model.id).toBe('grok-2');
      expect(result.routingExplanation).toContain('Code complexity');
    });
  });

  describe('Parameter Adjustment', () => {
    it('should increase temperature for long conversations', () => {
      const history: XAIMessage[] = Array(6).fill({
        role: 'user',
        content: 'Test message',
      });
      const result = router.route('Hello', history);
      expect(result.temperature).toBeGreaterThan(0.7);
    });

    it('should reduce tokens for rapid exchanges', () => {
      const history: XAIMessage[] = Array(4).fill({
        role: 'user',
        content: 'Quick reply',
      });
      const result = router.route('Hi', history);
      expect(result.maxTokens).toBeLessThan(256);
    });
  });
});

describe('TokenEstimator', () => {
  describe('Token Estimation', () => {
    it('should estimate English text tokens correctly', () => {
      const text = 'This is a test message';
      const estimate = TokenEstimator.estimateTokens(text, 'en');
      expect(estimate).toBeGreaterThan(0);
    });

    it('should estimate code tokens with higher ratio', () => {
      const code = '```typescript\nconst x: number = 42;\n```';
      const estimate = TokenEstimator.estimateCodeTokens(code);
      expect(estimate).toBeGreaterThan(TokenEstimator.estimateTokens(code, 'en'));
    });
  });

  describe('Conversation Analysis', () => {
    it('should estimate full conversation correctly', () => {
      const messages: XAIMessage[] = [
        { role: 'user', content: 'How do I use TypeScript?' },
        { role: 'assistant', content: 'TypeScript is a typed superset of JavaScript.' },
      ];
      const estimate = TokenEstimator.estimateConversationTokens(
        messages,
        'general',
        'direct_answer'
      );
      expect(estimate.totalTokens).toBeGreaterThan(0);
      expect(estimate.promptTokens).toBeGreaterThan(0);
      expect(estimate.expectedResponseTokens).toBeGreaterThan(0);
    });

    it('should suggest appropriate chunk sizes', () => {
      const modelLimit = 4096;
      const chunkSize = TokenEstimator.suggestChunkSize(8000, modelLimit);
      expect(chunkSize).toBeLessThan(modelLimit);
      expect(chunkSize).toBeGreaterThan(0);
    });
  });

  describe('Cost Estimation', () => {
    it('should calculate costs correctly', () => {
      const estimate = {
        promptTokens: 100,
        expectedResponseTokens: 200,
        totalTokens: 300,
      };
      const cost = TokenEstimator.estimateCost(estimate, 0.0001);
      expect(cost).toBe(0.03);
    });
  });
});
