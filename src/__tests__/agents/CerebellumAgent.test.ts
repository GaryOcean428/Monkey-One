import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CerebellumAgent } from '@/lib/agents/core/CerebellumAgent';

describe('CerebellumAgent', () => {
  let agent: CerebellumAgent;

  beforeEach(() => {
    vi.clearAllMocks();
    agent = new CerebellumAgent('cerebellum-1', 'Cerebellum Agent');
  });

  describe('initialization', () => {
    it('should initialize with correct properties', () => {
      expect(agent.id).toBe('cerebellum-1');
      expect(agent.role).toBe('motor_coordinator');
      expect(agent.capabilities).toContainEqual(
        expect.objectContaining({ name: 'motor_learning' })
      );
    });

    it('should load existing motor patterns', async () => {
      const loadPatternsSpy = vi.spyOn(agent as any, 'loadMotorPatterns');
      await agent.initialize();
      expect(loadPatternsSpy).toHaveBeenCalled();
    });
  });

  describe('motor pattern processing', () => {
    it('should analyze motor components from message', async () => {
      const analyzeSpy = vi.spyOn(agent as any, 'analyzeMotorComponents');
      await agent.processMessage({
        id: 'test',
        role: 'user',
        content: 'execute task',
        timestamp: Date.now()
      });
      expect(analyzeSpy).toHaveBeenCalled();
    });

    it('should create new motor pattern if none exists', async () => {
      const createPatternSpy = vi.spyOn(agent as any, 'createNewPattern');
      await agent.processMessage({
        id: 'test',
        role: 'user',
        content: 'new task',
        timestamp: Date.now()
      });
      expect(createPatternSpy).toHaveBeenCalled();
    });
  });

  describe('learning and optimization', () => {
    it('should update learning metrics after execution', async () => {
      const updateMetricsSpy = vi.spyOn(agent as any, 'updateLearningMetrics');
      await agent.processMessage({
        id: 'test',
        role: 'user',
        content: 'task execution',
        timestamp: Date.now()
      });
      expect(updateMetricsSpy).toHaveBeenCalled();
    });

    it('should optimize pattern timing based on accuracy', async () => {
      const optimizeSpy = vi.spyOn(agent as any, 'optimizePerformance');
      await agent.executeMotorPattern('test-pattern');
      expect(optimizeSpy).toHaveBeenCalled();
    });
  });
});