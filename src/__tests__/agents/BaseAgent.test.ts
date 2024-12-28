import { expect, describe, it } from 'vitest';
import { BaseAgent } from '../../lib/agents/base/BaseAgent';
import { AgentType, AgentStatus } from '../../lib/types/core';

describe('BaseAgent', () => {
  it('initializes with correct properties', () => {
    const agent = new BaseAgent('test-agent', 'Test Agent');
    expect(agent.id).toBe('test-agent');
    expect(agent.name).toBe('Test Agent');
    expect(agent.type).toBe(AgentType.SPECIALIST);
    expect(agent.status).toBe(AgentStatus.AVAILABLE);
    expect(agent.capabilities).toEqual([]);
  });

  it('handles capabilities correctly', () => {
    const agent = new BaseAgent('test-agent', 'Test Agent');
    const capability = { name: 'test', description: 'Test capability' };
    
    agent.addCapability(capability);
    expect(agent.hasCapability('test')).toBe(true);
    expect(agent.getCapabilities()).toContainEqual(capability);
    
    agent.removeCapability('test');
    expect(agent.hasCapability('test')).toBe(false);
    expect(agent.getCapabilities()).toEqual([]);
  });
});
