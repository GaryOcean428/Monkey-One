import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AutoEvaluator } from '../../lib/evaluation/AutoEvaluator';
import { memoryManager } from '../../lib/memory';
import { Agent, AgentType, AgentStatus, MessageType, AgentCapability, Message } from '../../types';

// Mock agent implementation
class MockAgent implements Agent {
  id: string;
  type = AgentType.SPECIALIST;
  capabilities: AgentCapability[] = [];
  status = AgentStatus.AVAILABLE;

  constructor(id: string) {
    this.id = id;
  }

  async initialize(): Promise<void> {}
  
  async processMessage(message: Message): Promise<Message> {
    return {
      id: 'response',
      type: MessageType.RESPONSE,
      role: 'assistant',
      content: 'Test response',
      timestamp: Date.now()
    };
  }

  getCapabilities(): AgentCapability[] {
    return this.capabilities;
  }

  registerCapability(capability: AgentCapability): void {
    this.capabilities.push(capability);
  }

  async handleMessage(message: Message): Promise<Message> {
    return this.processMessage(message);
  }
}

describe('AutoEvaluator', () => {
  let evaluator: AutoEvaluator;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(memoryManager, 'add').mockImplementation(async () => {});
    evaluator = AutoEvaluator.getInstance();
  });

  it('should evaluate agent based on scoring points', async () => {
    const agent = new MockAgent('test-agent');
    const messages = [
      {
        id: '1',
        type: MessageType.TASK,
        role: 'user',
        content: 'Hello',
        timestamp: Date.now()
      }
    ];

    evaluator.registerScoringPoint({
      id: 'response-time',
      description: 'Agent responds within 1 second',
      weight: 1,
      criteria: 'response time < 1000ms',
      evaluationCode: 'return messages.length > 0;'
    });

    const result = await evaluator.evaluateAgent(agent, messages, {});

    expect(result.maxScore).toBe(1);
    expect(result.score).toBe(1);
    expect(result.details).toHaveLength(1);
    expect(memoryManager.add).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'agent_evaluation',
        tags: ['evaluation', agent.id]
      })
    );
  });
});
