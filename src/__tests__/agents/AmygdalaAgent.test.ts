import { AmygdalaAgent } from '../../lib/agents/core/AmygdalaAgent';
import { memoryManager } from '../../lib/memory';
import type { Message } from '@/types';

// Mock dependencies
jest.mock('../../lib/memory');

describe('AmygdalaAgent', () => {
  let agent: AmygdalaAgent;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Initialize agent
    agent = new AmygdalaAgent('test-id', 'Test Amygdala');
  });

  describe('initialization', () => {
    it('should initialize with correct properties', () => {
      expect(agent.id).toBe('test-id');
      expect(agent.agentName).toBe('Test Amygdala');
      expect(agent.role).toBe('amygdala');
      expect(agent.getCapabilities()).toHaveLength(4);
      const capabilityNames = agent.getCapabilities().map(c => c.name);
      expect(capabilityNames).toEqual([
        'emotional_processing',
        'threat_detection',
        'reward_processing',
        'emotional_learning'
      ]);
    });

    it('should load emotional memories', async () => {
      const mockMemory = {
        fear: 0.5,
        reward: 0.3,
        arousal: 0.6,
        valence: -0.2
      };

      (memoryManager.search as jest.Mock).mockResolvedValueOnce([{
        content: JSON.stringify(mockMemory)
      }]);

      await agent['loadEmotionalMemories']();
      const state = agent.getCurrentEmotionalState();
      
      expect(state.fear).toBeGreaterThan(0);
      expect(state.reward).toBeGreaterThan(0);
    });
  });

  describe('emotional processing', () => {
    it('should detect fear triggers', async () => {
      const message: Message = {
        id: 'test-1',
        role: 'user',
        content: 'There is a critical error in the system',
        timestamp: Date.now()
      };

      const emotionalContent = await agent['analyzeEmotionalContent'](message);
      expect(emotionalContent.fear).toBeGreaterThan(0.5);
    });

    it('should detect reward triggers', async () => {
      const message: Message = {
        id: 'test-1',
        role: 'user',
        content: 'Great success! The task was completed perfectly',
        timestamp: Date.now()
      };

      const emotionalContent = await agent['analyzeEmotionalContent'](message);
      expect(emotionalContent.reward).toBeGreaterThan(0.5);
    });

    it('should calculate arousal levels', () => {
      const content = 'urgent emergency situation requires immediate action';
      const arousal = agent['calculateArousal'](content);
      expect(arousal).toBeGreaterThan(0.5);
    });

    it('should calculate valence', () => {
      const positiveContent = 'excellent work, great success';
      const negativeContent = 'terrible mistake, bad failure';

      const positiveValence = agent['calculateValence'](positiveContent);
      const negativeValence = agent['calculateValence'](negativeContent);

      expect(positiveValence).toBeGreaterThan(0);
      expect(negativeValence).toBeLessThan(0);
    });
  });

  describe('emotional responses', () => {
    it('should generate fear response for threats', async () => {
      const message: Message = {
        id: 'test-1',
        role: 'user',
        content: 'dangerous system failure detected',
        timestamp: Date.now()
      };

      const response = await agent.processMessage(message);
      expect(response.content).toContain('attention');
    });

    it('should generate reward response for success', async () => {
      const message: Message = {
        id: 'test-1',
        role: 'user',
        content: 'excellent achievement unlocked',
        timestamp: Date.now()
      };

      const response = await agent.processMessage(message);
      expect(response.content).toContain('promising');
    });

    it('should generate neutral response for neutral content', async () => {
      const message: Message = {
        id: 'test-1',
        role: 'user',
        content: 'processing standard operation',
        timestamp: Date.now()
      };

      const response = await agent.processMessage(message);
      expect(response.content).toContain('analyze');
    });
  });

  describe('emotional learning', () => {
    it('should update emotional state over time', () => {
      const initialState = agent.getCurrentEmotionalState();
      
      // Simulate emotional regulation
      agent['regulateEmotions']();
      
      const regulatedState = agent.getCurrentEmotionalState();
      expect(regulatedState.fear).toBeLessThan(initialState.fear);
      expect(regulatedState.reward).toBeLessThan(initialState.reward);
    });

    it('should store emotional memories', async () => {
      const message: Message = {
        id: 'test-1',
        role: 'user',
        content: 'critical system alert',
        timestamp: Date.now()
      };

      await agent.processMessage(message);

      expect(memoryManager.add).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'emotional_memory',
          tags: expect.arrayContaining(['emotion', 'amygdala'])
        })
      );
    });

    it('should apply emotional inertia', async () => {
      const initialState = agent.getCurrentEmotionalState();
      
      // Process high-fear message
      await agent.processMessage({
        id: 'test-1',
        role: 'user',
        content: 'critical emergency alert',
        timestamp: Date.now()
      });

      const updatedState = agent.getCurrentEmotionalState();
      expect(updatedState.fear).toBeGreaterThan(initialState.fear);

      // Process neutral message
      await agent.processMessage({
        id: 'test-2',
        role: 'user',
        content: 'standard operation',
        timestamp: Date.now()
      });

      // Fear should decrease but not immediately to zero
      const finalState = agent.getCurrentEmotionalState();
      expect(finalState.fear).toBeLessThan(updatedState.fear);
      expect(finalState.fear).toBeGreaterThan(0);
    });
  });

  describe('error handling', () => {
    it('should handle processing errors gracefully', async () => {
      // Mock memory manager to throw error
      (memoryManager.add as jest.Mock).mockRejectedValueOnce(new Error('Test error'));

      const response = await agent.processMessage({
        id: 'test-1',
        role: 'user',
        content: 'test message',
        timestamp: Date.now()
      });

      expect(response.content).toContain('emotional processing error');
    });
  });
});