import { expect, describe, it, beforeEach, vi } from 'vitest';
import { AgentState } from '../../lib/state/AgentState';
import { BaseAgent } from '../../lib/agents/base';
import { AgentStatus } from '../../lib/types/core';

describe('AgentState', () => {
  let state: AgentState;
  let agent: BaseAgent;

  beforeEach(() => {
    agent = new BaseAgent();
    state = new AgentState(agent);
    vi.useFakeTimers();
  });

  it('should transition to error state on timeout', async () => {
    state.registerState(AgentStatus.AVAILABLE, {
      allowedTransitions: [{ from: AgentStatus.AVAILABLE, to: AgentStatus.OFFLINE }],
      timeout: 1000
    });

    await vi.advanceTimersByTimeAsync(1000);
    expect(agent.status).toBe(AgentStatus.OFFLINE);
  });

  it('should clear timeouts on dispose', () => {
    const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');
    state.dispose();
    expect(clearTimeoutSpy).toHaveBeenCalled();
  });
});
