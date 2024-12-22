import { CerebellumAgent } from '../../lib/agents/core/CerebellumAgent';
import { memoryManager } from '../../lib/memory';
import type { Message } from '@/types';

// Mock dependencies
jest.mock('../../lib/memory');

describe('CerebellumAgent', () => {
  let agent: CerebellumAgent;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Initialize agent
    agent = new CerebellumAgent('test-id', 'Test Cerebellum');
  });

  describe('initialization', () => {
    it('should initialize with correct properties', () => {
      expect(agent.id).toBe('test-id');
      expect(agent.agentName).toBe('Test Cerebellum');
      expect(agent.role).toBe('cerebellum');
      expect(agent.getCapabilities()).toHaveLength(4);
      const capabilityNames = agent.getCapabilities().map(c => c.name);
      expect(capabilityNames).toEqual([
        'motor_learning',
        'timing_coordination',
        'error_correction',
        'sequence_optimization'
      ]);
    });

    it('should load existing motor patterns', async () => {
      const mockPattern = {
        id: 'test-pattern',
        sequence: ['move', 'rotate'],
        timing: [1000, 1000],
        accuracy: 0.8,
        confidence: 0.9,
        usageCount: 10,
        lastUsed: Date.now()
      };

      (memoryManager.search as jest.Mock).mockResolvedValueOnce([{
        content: JSON.stringify(mockPattern)
      }]);

      await agent['loadMotorPatterns']();
      const patterns = agent.getMotorPatterns();
      
      expect(patterns).toHaveLength(1);
      expect(patterns[0].id).toBe(mockPattern.id);
    });
  });

  describe('motor pattern processing', () => {
    it('should analyze motor components from message', async () => {
      const message: Message = {
        id: 'test-1',
        role: 'user',
        content: 'move forward and rotate left',
        timestamp: Date.now()
      };

      const components = await agent['analyzeMotorComponents'](message);
      expect(components).toContain('move');
      expect(components).toContain('rotate');
    });

    it('should create new motor pattern if none exists', async () => {
      const components = ['move', 'rotate'];
      const pattern = await agent['getMotorPattern'](components);

      expect(pattern.sequence).toEqual(components);
      expect(pattern.confidence).toBe(0.1); // Initial confidence
      expect(pattern.usageCount).toBe(0);
    });

    it('should execute motor pattern', async () => {
      const pattern = {
        id: 'test-pattern',
        sequence: ['move'],
        timing: [100], // Short timing for tests
        accuracy: 0.5,
        confidence: 0.5,
        usageCount: 0,
        lastUsed: Date.now()
      };

      const result = await agent['executeMotorPattern'](pattern);
      
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('accuracy');
      expect(result).toHaveProperty('executionTime');
      expect(result.executionTime).toBeGreaterThan(0);
    });
  });

  describe('learning and optimization', () => {
    it('should update learning metrics after execution', async () => {
      const initialMetrics = agent.getLearningMetrics();
      
      await agent.processMessage({
        id: 'test-1',
        role: 'user',
        content: 'move forward',
        timestamp: Date.now()
      });

      const updatedMetrics = agent.getLearningMetrics();
      expect(updatedMetrics).not.toEqual(initialMetrics);
    });

    it('should optimize pattern timing based on accuracy', async () => {
      const pattern = {
        id: 'test-pattern',
        sequence: ['move'],
        timing: [1000],
        accuracy: 0.9, // High accuracy
        confidence: 0.8,
        usageCount: 10,
        lastUsed: Date.now()
      };

      agent['motorPatterns'].set('move', pattern);
      agent['optimizePerformance']();

      const optimizedPattern = agent['motorPatterns'].get('move');
      expect(optimizedPattern?.timing[0]).toBeLessThan(1000); // Should speed up
    });

    it('should maintain pattern limit', async () => {
      // Add many patterns
      const actions = ['move', 'rotate', 'lift', 'drop', 'grab', 'release'];
      
      for (let i = 0; i < 1100; i++) {
        const randomActions = actions
          .sort(() => Math.random() - 0.5)
          .slice(0, 3);
        
        await agent.processMessage({
          id: `test-${i}`,
          role: 'user',
          content: randomActions.join(' and '),
          timestamp: Date.now()
        });
      }

      const patterns = agent.getMotorPatterns();
      expect(patterns.length).toBeLessThanOrEqual(1000);
    });

    it('should prioritize keeping frequently used patterns', async () => {
      // Create a frequently used pattern
      const frequentMessage: Message = {
        id: 'frequent',
        role: 'user',
        content: 'move and rotate',
        timestamp: Date.now()
      };

      // Execute multiple times
      for (let i = 0; i < 10; i++) {
        await agent.processMessage(frequentMessage);
      }

      // Create many other patterns
      for (let i = 0; i < 1100; i++) {
        await agent.processMessage({
          id: `test-${i}`,
          role: 'user',
          content: `action-${i}`,
          timestamp: Date.now()
        });
      }

      const patterns = agent.getMotorPatterns();
      const frequentPattern = patterns.find(p => 
        p.sequence.includes('move') && p.sequence.includes('rotate')
      );

      expect(frequentPattern).toBeDefined();
    });
  });

  describe('performance metrics', () => {
    it('should track execution speed', async () => {
      const message: Message = {
        id: 'test-1',
        role: 'user',
        content: 'move forward quickly',
        timestamp: Date.now()
      };

      await agent.processMessage(message);
      const metrics = agent.getLearningMetrics();
      
      expect(metrics.executionSpeed).toBeGreaterThan(0);
    });

    it('should adapt learning rate based on performance', async () => {
      const initialMetrics = agent.getLearningMetrics();
      
      // Process multiple successful executions
      for (let i = 0; i < 5; i++) {
        await agent.processMessage({
          id: `test-${i}`,
          role: 'user',
          content: 'move forward',
          timestamp: Date.now()
        });
      }

      const updatedMetrics = agent.getLearningMetrics();
      expect(updatedMetrics.refinementLevel).toBeGreaterThan(initialMetrics.refinementLevel);
    });
  });
});