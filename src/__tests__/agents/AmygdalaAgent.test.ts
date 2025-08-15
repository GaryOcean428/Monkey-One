import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AmygdalaAgent } from '../../lib/agents/core/AmygdalaAgent';
import { MessageType, AgentType } from '../../lib/types/core';

describe('AmygdalaAgent', () => {
  let agent: AmygdalaAgent;

  beforeEach(() => {
    vi.clearAllMocks();
    agent = new AmygdalaAgent('amygdala-1', 'Amygdala Agent');
  });

  describe('initialization', () => {
    it('should initialize with correct properties', () => {
      expect(agent.getId()).toBe('amygdala-1');
      expect(agent.getType()).toBe(AgentType.SPECIALIST);
      expect(agent.getCapabilities()).toContainEqual(
        expect.objectContaining({ name: 'emotional_processing' })
      );
    });

    it('should load emotional memories', async () => {
      const loadMemoriesSpy = vi.spyOn(agent as any, 'loadEmotionalMemories');
      await agent.initialize();
      expect(loadMemoriesSpy).toHaveBeenCalled();
    });
  });

  describe('emotional processing', () => {
    it('should detect fear triggers', async () => {
      const message = {
        id: 'test',
        type: MessageType.TASK,
        role: 'user',
        content: 'dangerous situation',
        timestamp: Date.now()
      };
      const response = await agent.processMessage(message);
      expect(response.content).toContain('caution');
    });

    it('should detect reward triggers', async () => {
      const message = {
        id: 'test',
        type: MessageType.TASK,
        role: 'user',
        content: 'great success',
        timestamp: Date.now()
      };
      const response = await agent.processMessage(message);
      expect(response.content).toContain('positive');
    });
  });

  describe('emotional learning', () => {
    it('should update emotional state over time', async () => {
      const initialState = agent.getCurrentEmotionalState();
      await agent.processMessage({
        id: 'test',
        type: MessageType.TASK,
        role: 'user',
        content: 'positive experience',
        timestamp: Date.now()
      });
      const updatedState = agent.getCurrentEmotionalState();
      expect(updatedState).not.toEqual(initialState);
    });

    it('should store emotional memories', async () => {
      const storeMemorySpy = vi.spyOn(agent as any, 'storeEmotionalMemory');
      await agent.processMessage({
        id: 'test',
        type: MessageType.TASK,
        role: 'user',
        content: 'memorable event',
        timestamp: Date.now()
      });
      expect(storeMemorySpy).toHaveBeenCalled();
    });
  });
});