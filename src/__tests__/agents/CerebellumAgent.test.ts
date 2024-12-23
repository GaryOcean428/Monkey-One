import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CerebellumAgent } from '@/lib/agents/core/CerebellumAgent';
import { AgentType, MotorPattern } from '@/types';

class TestCerebellumAgent extends CerebellumAgent {
  constructor() {
    super('test-id', 'Test Agent');
  }

  // Make protected method public for testing
  public async testExecuteMotorPattern(pattern: MotorPattern) {
    return this.executeMotorPattern(pattern);
  }
}
import { Message, MessageType } from '@/types';

describe('CerebellumAgent', () => {
  let agent: CerebellumAgent;

  beforeEach(() => {
    vi.clearAllMocks();
    agent = new TestCerebellumAgent();
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
        type: MessageType.TASK,
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
        type: MessageType.TASK,
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
        type: MessageType.TASK,
        role: 'user',
        content: 'task execution',
        timestamp: Date.now()
      });
      expect(updateMetricsSpy).toHaveBeenCalled();
    });

    it('should optimize pattern timing based on accuracy', async () => {
      const optimizeSpy = vi.spyOn(agent as any, 'optimizePerformance');
      await agent.testExecuteMotorPattern({
      id: 'test',
      sequence: ['move'],
      timing: [1000],
      accuracy: 0.5,
      confidence: 0.1,
      usageCount: 0,
      lastUsed: Date.now()
    });
      expect(optimizeSpy).toHaveBeenCalled();
    });
  });
});