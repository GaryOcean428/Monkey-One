import { describe, it, expect, beforeEach } from 'vitest';
import { AdvancedRouter } from '../router';
import { TokenEstimator } from '../tokenEstimator';
import { XAIMessage } from '../../types';
import { TechStackAnalyzer } from '../analyzers/techStackAnalyzer';
import { CodeAnalyzer } from '../analyzers/codeAnalyzer';
import { ContextAnalyzer } from '../analyzers/contextAnalyzer';
import { ResponseStrategySelector } from '../strategies/responseStrategy';
import { RouterConfig, TaskType, QuestionType } from '../types';

describe('Router System Integration', () => {
  let router: AdvancedRouter;
  let history: XAIMessage[];

  beforeEach(() => {
    router = new AdvancedRouter(0.5);
    history = [];
  });

  describe('End-to-End Routing', () => {
    it('should route TypeScript queries to high-tier model', () => {
      const query = 'How do I implement a generic type guard in TypeScript?';
      const config = router.route(query, history);

      expect(config.model.id).toBe('llama-3.3-70b');
      expect(config.responseStrategy).toBe('code_generation');
      expect(config.maxTokens).toBeGreaterThan(1024);
      expect(config.temperature).toBeCloseTo(0.7, 1);
    });

    it('should route casual queries to low-tier model', () => {
      const query = 'Hi, how are you today?';
      const config = router.route(query, history);

      expect(config.model.id).toBe('llama3-groq-8b');
      expect(config.responseStrategy).toBe('casual_conversation');
      expect(config.maxTokens).toBeLessThan(512);
      expect(config.temperature).toBeGreaterThan(0.8);
    });

    it('should handle complex system design queries', () => {
      const query = 'Design a scalable microservices architecture for a real-time chat application';
      const config = router.route(query, history);

      expect(config.model.id).toBe('grok-2');
      expect(config.responseStrategy).toBe('chain_of_thought');
      expect(config.maxTokens).toBeGreaterThan(2048);
    });
  });

  describe('Context-Aware Routing', () => {
    it('should adapt to conversation history', () => {
      history = [
        { role: 'user', content: 'What is TypeScript?' },
        { role: 'assistant', content: 'TypeScript is a typed superset of JavaScript...' },
        { role: 'user', content: 'How do I use interfaces?' },
      ];

      const query = 'Can you show me an example of generics?';
      const config = router.route(query, history);

      expect(config.model.id).toBe('llama-3.3-70b');
      expect(config.responseStrategy).toBe('code_generation');
      expect(config.routingExplanation).toContain('typescript');
    });

    it('should handle rapid exchanges', () => {
      history = Array(4).fill({
        role: 'user',
        content: 'Quick question',
      });

      const query = 'Another quick one';
      const config = router.route(query, history);

      expect(config.maxTokens).toBeLessThan(512);
      expect(config.responseStrategy).toBe('direct_answer');
    });
  });

  describe('Tech Stack Analysis Integration', () => {
    it('should detect multiple tech stacks', () => {
      const query = 'How do I implement authentication in a React app with TypeScript and Supabase?';
      const stacks = TechStackAnalyzer.analyze(query);

      expect(stacks).toContain('typescript');
      expect(stacks).toContain('react');
      expect(stacks).toContain('database');
      expect(stacks).toContain('security');

      const config = router.route(query, history);
      expect(config.model.id).toBe('grok-2');
      expect(config.routingExplanation).toContain('multiple technologies');
    });

    it('should calculate correct complexity multiplier', () => {
      const stacks = ['typescript', 'react', 'security'] as const;
      const multiplier = TechStackAnalyzer.getComplexityMultiplier(stacks);

      expect(multiplier).toBeGreaterThan(1.5);
      expect(multiplier).toBeLessThan(2.5);
    });
  });

  describe('Code Analysis Integration', () => {
    it('should detect code complexity indicators', () => {
      const query = 'Implement a balanced binary search tree with TypeScript';
      const complexity = CodeAnalyzer.analyzeComplexity(query);
      const indicators = CodeAnalyzer.getIndicators(query);

      expect(complexity).toBeGreaterThan(0.5);
      expect(indicators).toContain('dataStructures');
      expect(indicators).toContain('algorithms');

      const config = router.route(query, history);
      expect(config.model.id).toBe('grok-2');
      expect(config.maxTokens).toBeGreaterThan(2048);
    });

    it('should identify performance considerations', () => {
      const query = 'How can I optimize the performance of my React components?';
      const indicators = CodeAnalyzer.getIndicators(query);

      expect(indicators).toContain('performance');
      
      const config = router.route(query, history);
      expect(config.routingExplanation).toContain('performance');
    });
  });

  describe('Context Analysis Integration', () => {
    it('should correctly identify task types', () => {
      const queries: Record<TaskType, string> = {
        coding: 'Write a function to sort an array',
        analysis: 'Compare REST and GraphQL',
        creative: 'Generate a color scheme',
        casual: 'How are you today?',
        general: 'What is an API?',
      };

      Object.entries(queries).forEach(([expectedType, query]) => {
        const taskType = ContextAnalyzer.identifyTaskType(query);
        expect(taskType).toBe(expectedType);

        const config = router.route(query, history);
        expect(config.routingExplanation).toContain(taskType);
      });
    });

    it('should classify questions correctly', () => {
      const queries: Record<QuestionType, string> = {
        problem_solving: 'How do I implement authentication?',
        factual: 'What is TypeScript?',
        yes_no: 'Is React a framework?',
        analysis: 'Compare MongoDB and PostgreSQL',
        casual: 'Hi there!',
        open_ended: 'Tell me about databases',
      };

      Object.entries(queries).forEach(([expectedType, query]) => {
        const questionType = ContextAnalyzer.classifyQuestion(query);
        expect(questionType).toBe(expectedType);
      });
    });
  });

  describe('Response Strategy Integration', () => {
    it('should select appropriate strategies', () => {
      const testCases = [
        {
          query: 'How do I implement authentication?',
          expected: 'chain_of_thought',
        },
        {
          query: 'What is TypeScript?',
          expected: 'direct_answer',
        },
        {
          query: 'Is React a framework?',
          expected: 'boolean_with_explanation',
        },
        {
          query: 'Compare MongoDB and PostgreSQL',
          expected: 'comparative_analysis',
        },
      ];

      testCases.forEach(({ query, expected }) => {
        const config = router.route(query, history);
        expect(config.responseStrategy).toBe(expected);
      });
    });

    it('should adjust strategies based on context', () => {
      history = Array(5).fill({
        role: 'user',
        content: 'Quick question',
      });

      const query = 'How do I implement authentication?';
      const config = router.route(query, history);

      expect(config.responseStrategy).toBe('direct_answer');
      expect(config.maxTokens).toBeLessThan(1024);
    });
  });

  describe('Token Estimation Integration', () => {
    it('should estimate conversation tokens correctly', () => {
      history = [
        { role: 'user', content: 'What is TypeScript?' },
        { role: 'assistant', content: 'TypeScript is a typed superset of JavaScript that compiles to plain JavaScript.' },
      ];

      const estimate = TokenEstimator.estimateConversationTokens(
        history,
        'coding',
        'chain_of_thought'
      );

      expect(estimate.promptTokens).toBeGreaterThan(0);
      expect(estimate.expectedResponseTokens).toBeGreaterThan(0);
      expect(estimate.totalTokens).toBe(
        estimate.promptTokens + estimate.expectedResponseTokens
      );
    });

    it('should handle context limits', () => {
      const longHistory = Array(10).fill({
        role: 'user',
        content: 'A '.repeat(1000),
      });

      const estimate = TokenEstimator.estimateConversationTokens(
        longHistory,
        'general',
        'direct_answer'
      );

      expect(TokenEstimator.isApproachingContextLimit(estimate, 4096)).toBe(true);
      
      const config = router.route('Next question', longHistory);
      expect(config.maxTokens).toBeLessThan(1024);
      expect(config.responseStrategy).toBe('direct_answer');
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle invalid queries gracefully', () => {
      const query = '';
      expect(() => router.route(query, history)).not.toThrow();
    });

    it('should handle malformed history', () => {
      const invalidHistory = [{ invalid: 'data' }] as any;
      expect(() => router.route('test', invalidHistory)).not.toThrow();
    });

    it('should handle extreme token estimates', () => {
      const hugeQuery = 'a'.repeat(1000000);
      expect(() => router.route(hugeQuery, history)).not.toThrow();
    });
  });
});
