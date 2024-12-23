import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AgentRegistry } from '@/lib/registry/AgentRegistry';
import { BaseAgent } from '@/lib/agents/base';

class TestAgent extends BaseAgent {
  constructor() {
    super('test-id', 'Test Agent', 'tester', [
      { name: 'test', description: 'Test capability', version: '1.0.0' }
    ]);
  }

  async processMessage() {
    return {
      id: 'test',
      role: 'assistant',
      content: 'test response',
      timestamp: Date.now()
    };
  }
}

describe('AgentRegistry', () => {
  let registry: AgentRegistry;

  beforeEach(() => {
    registry = AgentRegistry.getInstance();
    registry.reset();
  });

  describe('singleton pattern', () => {
    it('should return the same instance', () => {
      const instance1 = AgentRegistry.getInstance();
      const instance2 = AgentRegistry.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('agent registration', () => {
    it('should register agent type successfully', () => {
      registry.register('test', () => new TestAgent());
      const agent = registry.create('test');
      expect(agent).toBeInstanceOf(TestAgent);
    });

    it('should throw error when registering duplicate agent type', () => {
      registry.register('test', () => new TestAgent());
      expect(() => registry.register('test', () => new TestAgent())).not.toThrow();
    });
  });

  describe('agent creation', () => {
    it('should create agent instance', () => {
      registry.register('test', () => new TestAgent());
      const agent = registry.create('test');
      expect(agent).toBeInstanceOf(TestAgent);
      expect(agent.id).toBe('test-id');
    });

    it('should throw error for unregistered agent type', () => {
      expect(() => registry.create('unknown')).toThrow('Agent type unknown not registered');
    });
  });

  describe('registry management', () => {
    it('should unregister agent type', () => {
      registry.register('test', () => new TestAgent());
      registry.unregister('test');
      expect(() => registry.create('test')).toThrow('Agent type test not registered');
    });

    it('should reset registry', () => {
      registry.register('test', () => new TestAgent());
      registry.reset();
      expect(() => registry.create('test')).toThrow('Agent type test not registered');
    });

    it('should throw error when unregistering non-existent type', () => {
      expect(() => registry.unregister('unknown')).toThrow('Agent type unknown not registered');
    });
  });
});
