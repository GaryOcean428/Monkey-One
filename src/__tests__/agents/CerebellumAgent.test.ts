import { expect, describe, it, vi, beforeEach } from 'vitest';
import { CerebellumAgent } from '../../lib/agents/core/CerebellumAgent';
import { memoryManager } from '../../lib/memory';
import { MessageType } from '../../lib/types/core';

vi.mock('../../lib/memory', () => ({
  memoryManager: {
    add: vi.fn(),
    search: vi.fn().mockResolvedValue([])
  }
}));

describe('CerebellumAgent', () => {
  let agent: CerebellumAgent;

  beforeEach(() => {
    agent = new CerebellumAgent();
  });

  it('should initialize with correct properties', () => {
    expect(agent.id).toBe('cerebellum-1');
    expect(agent.name).toBe('Cerebellum Agent');
  });

  it('should handle motor pattern messages', async () => {
    const message = {
      id: '1',
      type: MessageType.TASK,
      role: 'user',
      content: 'move and rotate',
      timestamp: Date.now()
    };

    const response = await agent.processMessage(message);
    expect(response.content).toContain('Executed motor pattern');
  });

  it('should store motor patterns', async () => {
    const message = {
      id: '1',
      type: MessageType.TASK,
      role: 'user',
      content: 'move and rotate',
      timestamp: Date.now()
    };

    await agent.processMessage(message);
    expect(memoryManager.add).toHaveBeenCalled();
  });

  it('should handle errors gracefully', async () => {
    const message = {
      id: '1',
      type: MessageType.TASK,
      role: 'user',
      content: '',
      timestamp: Date.now()
    };

    const response = await agent.processMessage(message);
    expect(response.content).toContain('error');
  });

  it('should track learning metrics', async () => {
    const message = {
      id: '1',
      type: MessageType.TASK,
      role: 'user',
      content: 'move and rotate',
      timestamp: Date.now()
    };

    await agent.processMessage(message);
    const metrics = agent.getLearningMetrics();
    expect(metrics.errorRate).toBeDefined();
    expect(metrics.refinementLevel).toBeDefined();
  });

  it('should maintain motor patterns', async () => {
    const message = {
      id: '1',
      type: MessageType.TASK,
      role: 'user',
      content: 'move and rotate',
      timestamp: Date.now()
    };

    await agent.processMessage(message);
    const patterns = agent.getMotorPatterns();
    expect(patterns.length).toBeGreaterThan(0);
  });
});