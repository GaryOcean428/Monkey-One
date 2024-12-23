import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AgentSession } from '@/lib/sessions/AgentSession';
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

describe('AgentSession', () => {
  let session: AgentSession;
  let agent: TestAgent;

  beforeEach(() => {
    vi.clearAllMocks();
    agent = new TestAgent();
    session = new AgentSession(agent);
  });

  describe('message handling', () => {
    it('should handle valid messages', async () => {
      const message = {
        id: 'test',
        role: 'user',
        content: 'hello',
        timestamp: Date.now()
      };
      const response = await session.handleMessage(message);
      expect(response).toBeDefined();
      expect(response.content).toBe('test response');
    });

    it('should throw error for invalid message format', async () => {
      const invalidMessage = { content: 'invalid' };
      await expect(session.handleMessage(invalidMessage as any)).rejects.toThrow();
    });
  });

  describe('memory management', () => {
    it('should add memory items', () => {
      const item = {
        type: 'test',
        content: 'memory content',
        timestamp: Date.now()
      };
      session.addMemoryItem(item);
      const memory = session.getMemory();
      expect(memory).toContainEqual(item);
    });

    it('should get memory by type', () => {
      const item = {
        type: 'test',
        content: 'memory content',
        timestamp: Date.now()
      };
      session.addMemoryItem(item);
      const memory = session.getMemoryByType('test');
      expect(memory).toContainEqual(item);
    });
  });

  describe('session cleanup', () => {
    it('should dispose session resources', () => {
      const clearIntervalSpy = vi.spyOn(global, 'clearInterval');
      session.dispose();
      expect(clearIntervalSpy).toHaveBeenCalled();
    });
  });
});
