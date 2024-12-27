import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HandoffManager } from '../../../lib/workflow/agents/HandoffManager';
import { AgentRegistry } from '../../../lib/registry/AgentRegistry';
import { memoryManager } from '../../../lib/memory';
import { Agent, AgentCapability, Message } from '../../../types';
import { MessageType } from '../../../constants/enums';

// Mock agent implementation
class MockAgent implements Agent {
  id: string;
  capabilities: AgentCapability[];
  status: 'available' | 'busy' | 'offline';

  constructor(id: string, capabilities: AgentCapability[]) {
    this.id = id;
    this.type = 'specialist';
    this.capabilities = capabilities;
    this.status = 'available';
  }

  async initialize(context: Record<string, unknown>): Promise<void> {
    // Mock initialization
  }

  async processMessage(message: Message): Promise<Message> {
    return {
      id: 'test',
      type: 'response',
      role: 'assistant',
      content: 'Test response',
      timestamp: Date.now()
    };
  }
}

describe('HandoffManager', () => {
  let handoffManager: HandoffManager;
  let registry: AgentRegistry;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Mock memory manager
    vi.spyOn(memoryManager, 'add').mockImplementation(async () => {});
    vi.spyOn(memoryManager, 'search').mockImplementation(async () => []);

    // Setup test agents
    registry = AgentRegistry.getInstance();
    registry.reset();

    // Get handoff manager instance
    handoffManager = HandoffManager.getInstance();
  });

  describe('evaluateHandoff', () => {
    it('should detect required capabilities from message', async () => {
      const agent = new MockAgent('test-agent', []);
      const message: Message = {
        id: 'test',
        type: MessageType.TASK,
        role: 'user',
        content: 'Hola, necesito ayuda en español',
        timestamp: Date.now()
      };

      const result = await handoffManager.evaluateHandoff(agent, message, {});
      expect(result).not.toBeNull();
      expect(result?.capability.name).toBe('spanish_language');
    });

    it('should return null if agent has required capability', async () => {
      const agent = new MockAgent('test-agent', [{
        name: 'spanish_language',
        description: 'Ability to communicate in Spanish'
      }]);
      const message: Message = {
        id: 'test',
        type: MessageType.TASK,
        role: 'user',
        content: 'Hola, necesito ayuda en español',
        timestamp: Date.now()
      };

      const result = await handoffManager.evaluateHandoff(agent, message, {});
      expect(result).toBeNull();
    });
  });

  describe('findBestAgent', () => {
    it('should find agent with matching capability', async () => {
      const spanishAgent = new MockAgent('spanish-agent', [{
        name: 'spanish_language',
        description: 'Ability to communicate in Spanish'
      }]);
      registry.register('spanish', () => spanishAgent);

      const criteria = {
        capability: {
          name: 'spanish_language',
          description: 'Ability to communicate in Spanish'
        },
        confidence: 0.9,
        context: {}
      };

      const result = await handoffManager.findBestAgent(criteria);
      expect(result).not.toBeNull();
      expect(result?.id).toBe('spanish-agent');
    });

    it('should return null if no matching agent found', async () => {
      const criteria = {
        capability: {
          name: 'nonexistent_capability',
          description: 'A capability that no agent has'
        },
        confidence: 0.9,
        context: {}
      };

      const result = await handoffManager.findBestAgent(criteria);
      expect(result).toBeNull();
    });
  });

  describe('executeHandoff', () => {
    it('should successfully transfer context between agents', async () => {
      const fromAgent = new MockAgent('from-agent', []);
      const toAgent = new MockAgent('to-agent', [{
        name: 'spanish_language',
        description: 'Ability to communicate in Spanish'
      }]);

      const context = { key: 'value' };
      const result = await handoffManager.executeHandoff(fromAgent, toAgent, context);

      expect(result).toBe(true);
      expect(memoryManager.add).toHaveBeenCalledWith(expect.objectContaining({
        type: 'agent_handoff',
        tags: ['handoff', fromAgent.id, toAgent.id]
      }));
    });

    it('should handle handoff failures gracefully', async () => {
      const fromAgent = new MockAgent('from-agent', []);
      const toAgent = new MockAgent('to-agent', []);

      vi.spyOn(memoryManager, 'add').mockRejectedValueOnce(new Error('Test error'));

      const context = { key: 'value' };
      const result = await handoffManager.executeHandoff(fromAgent, toAgent, context);

      expect(result).toBe(false);
    });
  });
});
