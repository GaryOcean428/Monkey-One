import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BaseAgent } from '@/lib/agents/base';
import { AgentCapability } from '@/types';

// Create test agent class
class TestAgent extends BaseAgent {
  constructor() {
    super('test-agent', 'Test Agent', 'tester', [
      {
        name: 'test',
        description: 'Test capability',
        version: '1.0.0'
      }
    ]);
  }

  async processMessage() {
    // Test implementation
    return {
      id: 'test',
      role: 'assistant',
      content: 'test response',
      timestamp: Date.now()
    };
  }
}

describe('BaseAgent', () => {
  let agent: TestAgent;

  beforeEach(() => {
    agent = new TestAgent();
  });

  describe('initialization', () => {
    it('should initialize with correct properties', () => {
      expect(agent.id).toBe('test-agent');
      expect(agent.role).toBe('tester');
      expect(agent.capabilities).toHaveLength(1);
      expect(agent.capabilities[0].name).toBe('test');
      expect(agent.subordinates).toEqual([]);
    });
  });

  describe('capability management', () => {
    it('should register new capabilities', () => {
      const newCapability: AgentCapability = {
        name: 'new-capability',
        description: 'A new test capability',
        version: '1.0.0'
      };
      agent.capabilities.push(newCapability);
      expect(agent.capabilities).toContain(newCapability);
    });

    it('should check capability existence', () => {
      expect(agent.hasCapability('test')).toBe(true);
      expect(agent.hasCapability('non-existent')).toBe(false);
    });
  });
});
