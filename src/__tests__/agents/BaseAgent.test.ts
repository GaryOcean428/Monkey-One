import { describe, it, expect } from 'vitest';
import { BaseAgent } from '../../lib/agents/base';
import { AgentType, AgentStatus, type AgentCapability } from '../../lib/types/core';
import { MockAgent, createMockMessage } from '../../test/test-utils';

describe('BaseAgent', () => {
  class TestAgent extends MockAgent {
    constructor(id: string) {
      super(id, AgentType.WORKER);
    }
  }

  it('initializes with correct properties', () => {
    const agent = new TestAgent('test-agent');
    expect(agent.id).toBe('test-agent');
    expect(agent.type).toBe(AgentType.WORKER);
    expect(agent.status).toBe(AgentStatus.AVAILABLE);
    expect(agent.capabilities).toEqual([]);
  });

  it('manages capabilities correctly', () => {
    const agent = new TestAgent('test-agent');
    const capability: AgentCapability = {
      name: 'test-capability',
      description: 'Test capability'
    };

    agent.addCapability(capability);
    expect(agent.hasCapability('test-capability')).toBe(true);
    expect(agent.getCapabilities()).toContainEqual(capability);

    agent.removeCapability('test-capability');
    expect(agent.hasCapability('test-capability')).toBe(false);
  });
});
