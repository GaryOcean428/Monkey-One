import { OrchestratorAgent } from '../../lib/agents/orchestrator';
import { memoryManager } from '../../lib/memory';
import { AgentRegistry } from '../../lib/registry/AgentRegistry';
import type { Message, TaskMessage } from '../../types';

// Mock dependencies
jest.mock('../../lib/memory');
jest.mock('../../lib/registry/AgentRegistry');
jest.mock('../../lib/monitoring/ToolMonitor');
jest.mock('../../lib/patterns/AgentMixture');
jest.mock('../../lib/patterns/DebateCoordinator');
jest.mock('../../lib/tools/CalculatorTool');

describe('OrchestratorAgent', () => {
  let agent: OrchestratorAgent;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Initialize agent
    agent = new OrchestratorAgent('test-id', 'Test Orchestrator');
  });

  describe('initialization', () => {
    it('should initialize with correct properties', () => {
      expect(agent.id).toBe('test-id');
      expect(agent.agentName).toBe('Test Orchestrator');
      expect(agent.role).toBe('Orchestrator');
      expect(agent.getCapabilities()).toHaveLength(5);
      const capabilityNames = agent.getCapabilities().map(c => c.name);
      expect(capabilityNames).toEqual([
        'task_planning',
        'task_delegation', 
        'progress_tracking',
        'distributed_execution',
        'multi_agent_interaction'
      ]);
      expect(agent.subordinates).toEqual([]);
    });
  });

  describe('task handling', () => {
    const mockTask: TaskMessage = {
      id: 'task-1',
      role: 'user',
      content: 'Test task',
      timestamp: Date.now(),
      type: 'task'
    };

    beforeEach(() => {
      // Mock memory manager
      (memoryManager.add as jest.Mock).mockResolvedValue(undefined);
    });

    it('should store original task in memory', async () => {
      await agent.handleTask(mockTask, {});
      
      expect(memoryManager.add).toHaveBeenCalledWith({
        type: 'task',
        content: mockTask.content,
        tags: ['original-task']
      });
    });

    it('should update progress through task execution stages', async () => {
      await agent.handleTask(mockTask, {});

      expect(agent['progressLedger'].status).toBe('completed');
      expect(memoryManager.add).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'summary',
          tags: ['task-completion']
        })
      );
    });

    it('should handle task execution errors', async () => {
      // Mock memory manager to throw error
      (memoryManager.add as jest.Mock).mockRejectedValueOnce(new Error('Test error'));

      const response = await agent.handleTask(mockTask, {});
      
      expect(response.content).toContain('Error executing task: Test error');
      expect(memoryManager.add).toHaveBeenCalledWith({
        type: 'error',
        content: expect.stringContaining('Test error'),
        tags: ['error', 'task-failure']
      });
    });
  });

  describe('tool handling', () => {
    const mockToolCall = {
      toolName: 'calculator',
      args: { operation: 'add', numbers: [1, 2] }
    };

    it('should handle tool calls and log executions', async () => {
      const mockResult = { status: 'success', result: 3 };
      agent['toolAgent'].handleToolCall = jest.fn().mockResolvedValue(mockResult);

      const result = await agent.handleToolCall(mockToolCall);

      expect(result).toEqual(mockResult);
      expect(agent['toolMonitor'].logExecution).toHaveBeenCalledWith(
        expect.any(Object),
        mockToolCall.args,
        mockResult
      );
    });

    it('should handle tool execution errors', async () => {
      const error = new Error('Tool execution failed');
      agent['toolAgent'].handleToolCall = jest.fn().mockRejectedValue(error);

      await expect(agent.handleToolCall(mockToolCall)).rejects.toThrow(error);
    });
  });

  describe('plan management', () => {
    it('should create and store initial plan', async () => {
      const task = 'Test task';
      await agent['planTask'](task);

      expect(memoryManager.add).toHaveBeenCalledWith({
        type: 'plan',
        content: expect.any(String),
        tags: ['task-plan']
      });

      expect(agent['progressLedger'].status).toBe('planned');
    });

    it('should handle plan revision on failure', async () => {
      // Setup initial state
      agent['progressLedger'] = {
        completedSteps: ['step1'],
        currentStep: 'failed-step',
        remainingSteps: ['step3'],
        status: 'in_progress'
      };

      await agent['revisePlan']();

      expect(memoryManager.add).toHaveBeenCalledWith({
        type: 'plan-revision',
        content: expect.any(String),
        tags: ['plan-revision']
      });

      expect(agent['progressLedger'].status).toBe('replanned');
    });
  });

  describe('task delegation', () => {
    it('should analyze and delegate tasks', async () => {
      const task = 'Test task';
      const response = await agent['delegateTask'](task);

      expect(response).toMatchObject({
        id: expect.any(String),
        role: 'assistant',
        content: expect.stringContaining(task),
        timestamp: expect.any(Number),
        metadata: expect.objectContaining({
          status: 'completed'
        })
      });
    });
  });
});
