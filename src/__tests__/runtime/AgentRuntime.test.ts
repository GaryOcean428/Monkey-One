import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Message, MessageType } from '@/types';
import { AgentRuntime } from '@/lib/runtime/AgentRuntime';
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
      type: MessageType.RESPONSE,
      role: 'assistant',
      content: 'test response',
      timestamp: Date.now()
    };
  }
}

describe('AgentRuntime', () => {
  let runtime: AgentRuntime;
  let agent: TestAgent;

  beforeEach(() => {
    vi.clearAllMocks();
    agent = new TestAgent();
    runtime = new AgentRuntime(agent);
  });

  describe('initialization', () => {
    it('should initialize with an agent', () => {
      expect(runtime.getAgent()).toBe(agent);
    });

    it('should create a message queue', () => {
      expect(runtime['messageQueue']).toBeDefined();
    });

    it('should start message processing', async () => {
      const processSpy = vi.spyOn(runtime as any, 'processQueue');
      await runtime.startProcessing();
      expect(processSpy).toHaveBeenCalled();
    });
  });

  describe('message handling', () => {
    it('should enqueue messages', async () => {
      const message = {
        id: 'test',
        type: MessageType.TASK,
        role: 'user',
        content: 'hello',
        timestamp: Date.now()
      };
      await runtime.enqueueMessage(message);
      expect(runtime['messageQueue'].size).toBe(1);
    });

    it('should process messages through the agent', async () => {
      const processSpy = vi.spyOn(agent, 'processMessage');
      const message = {
        id: 'test',
        type: MessageType.TASK,
        role: 'user',
        content: 'hello',
        timestamp: Date.now()
      };
      await runtime.enqueueMessage(message);
      await runtime.processQueue();
      expect(processSpy).toHaveBeenCalled();
    });
  });

  describe('lifecycle management', () => {
    it('should stop processing on shutdown', async () => {
      await runtime.startProcessing();
      await runtime.shutdown();
      expect(runtime.isActive()).toBe(false);
    });

    it('should process remaining messages before shutdown', async () => {
      const message: Message = {
        id: 'test',
        type: MessageType.TASK,
        role: 'user',
        content: 'hello',
        timestamp: Date.now()
      };
      await runtime.enqueueMessage(message);
      await runtime.shutdown();
      expect(runtime['messageQueue'].size).toBe(0);
    });
  });
});
