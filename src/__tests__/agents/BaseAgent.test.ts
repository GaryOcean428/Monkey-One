import { describe, it, expect, beforeEach } from 'vitest';
import { BaseAgent } from '../../lib/agents/base';
import type { Message } from '../../types';

// Create concrete test agent class
class TestAgent extends BaseAgent {
  async processMessage(message: Message): Promise<Message> {
    return {
      id: 'response-1',
      role: 'assistant',
      content: `Processed: ${message.content}`,
      timestamp: Date.now()
    };
  }
}

describe('BaseAgent', () => {
  let agent: TestAgent;

  beforeEach(() => {
    agent = new TestAgent('test-id', 'Test Agent', 'tester', ['test']);
  });

  describe('initialization', () => {
    it('should initialize with correct properties', () => {
      expect(agent.id).toBe('test-id');
      expect(agent.agentName).toBe('Test Agent');
      expect(agent.role).toBe('tester');
      expect(agent.getCapabilities()).toHaveLength(1);
      expect(agent.getCapabilities()[0].name).toBe('test');
      expect(agent.subordinates).toEqual([]);
    });
  });

  describe('capability management', () => {
    it('should register new capabilities', () => {
      agent.registerCapability({
        name: 'new-capability',
        description: 'A new test capability'
      });

      expect(agent.getCapabilities()).toHaveLength(2);
      expect(agent.hasCapability('new-capability')).toBe(true);
    });

    it('should check capability existence', () => {
      expect(agent.hasCapability('test')).toBe(true);
      expect(agent.hasCapability('non-existent')).toBe(false);
    });
  });

  // Additional tests can be added here
});
