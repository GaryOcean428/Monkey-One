import { expect, describe, it, vi, beforeEach } from 'vitest';
import { AgentSession } from '../../lib/sessions/AgentSession';
import { Agent, AgentStatus, Message, MemoryItem } from '../../types/core';

describe('AgentSession', () => {
  let session: AgentSession;
  let mockAgent: Agent;

  beforeEach(() => {
    mockAgent = {
      id: 'test-agent',
      type: 'SPECIALIST',
      capabilities: [],
      status: AgentStatus.AVAILABLE,
      initialize: vi.fn(),
      processMessage: vi.fn(),
      getCapabilities: vi.fn(),
      hasCapability: vi.fn(),
      addCapability: vi.fn(),
      removeCapability: vi.fn(),
      shutdown: vi.fn()
    };
    session = new AgentSession(mockAgent);
  });

  describe('message handling', () => {
    it('should handle valid messages', async () => {
      const message: Message = {
        id: 'test',
        type: 'TASK',
        role: 'user',
        content: 'test message',
        timestamp: Date.now()
      };
      await session.handleMessage(message);
      expect(session.getHistory()).toContainEqual(message);
    });

    it('should throw error for invalid message format', async () => {
      const invalidMessage = { id: 'test' } as Message;
      await expect(session.handleMessage(invalidMessage)).rejects.toThrow('Invalid message');
    });
  });

  describe('memory management', () => {
    it('should add memory items', async () => {
      const item: MemoryItem = {
        id: 'test',
        type: 'task',
        content: 'test memory',
        tags: []
      };
      await session.addMemoryItem(item);
      expect(session.getMemory()).toContainEqual(item);
    });

    it('should get memory by type', async () => {
      const item: MemoryItem = {
        id: 'test',
        type: 'task',
        content: 'test memory',
        tags: []
      };
      await session.addMemoryItem(item);
      expect(session.getMemoryByType('task')).toContainEqual(item);
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
