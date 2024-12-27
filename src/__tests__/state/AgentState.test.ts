import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AgentState } from '../../lib/state/AgentState';
import { AgentStatus } from '../../constants/enums';
import type { StateConfig, StateTransition } from '../../lib/state/AgentState';

describe('AgentState', () => {
  let state: AgentState;
  let mockAgent: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockAgent = {
      id: 'test-agent',
      status: AgentStatus.AVAILABLE,
      type: 'test'
    };
    state = new AgentState(mockAgent);
  });

  describe('state registration', () => {
    it('should register new state configuration', () => {
      const config: StateConfig = {
        allowedTransitions: [{
          from: AgentStatus.AVAILABLE,
          to: AgentStatus.BUSY
        }],
        timeout: 1000
      };
      state.registerState(AgentStatus.AVAILABLE, config);
      expect(mockAgent.status).toBe(AgentStatus.AVAILABLE);
    });

    it('should throw error when registering duplicate state', () => {
      const config: StateConfig = {
        allowedTransitions: [{
          from: AgentStatus.AVAILABLE,
          to: AgentStatus.BUSY
        }],
        timeout: 1000
      };
      state.registerState(AgentStatus.AVAILABLE, config);
      expect(() => state.registerState(AgentStatus.AVAILABLE, config)).toThrow();
    });
  });

  describe('state transitions', () => {
    beforeEach(() => {
      state.registerState(AgentStatus.AVAILABLE, {
        allowedTransitions: [{
          from: AgentStatus.AVAILABLE,
          to: AgentStatus.BUSY
        }],
        timeout: 1000
      });
      state.registerState(AgentStatus.BUSY, {
        allowedTransitions: [{
          from: AgentStatus.BUSY,
          to: AgentStatus.AVAILABLE
        }, {
          from: AgentStatus.BUSY,
          to: AgentStatus.OFFLINE
        }],
        timeout: 1000
      });
    });

    it('should transition between allowed states', async () => {
      await state.transition(AgentStatus.BUSY);
      expect(mockAgent.status).toBe(AgentStatus.BUSY);
    });

    it('should throw error for invalid transitions', async () => {
      await expect(state.transition(AgentStatus.OFFLINE)).rejects.toThrow();
    });
  });

  describe('state timeout', () => {
    it('should transition to error state on timeout', async () => {
      state.registerState(AgentStatus.AVAILABLE, {
        allowedTransitions: [{
          from: AgentStatus.AVAILABLE,
          to: AgentStatus.OFFLINE
        }],
        timeout: 100
      });
      
      await new Promise(resolve => setTimeout(resolve, 150));
      expect(mockAgent.status).toBe(AgentStatus.OFFLINE);
    });
  });

  describe('cleanup', () => {
    it('should clear timeouts on dispose', () => {
      const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');
      state.dispose();
      expect(clearTimeoutSpy).toHaveBeenCalled();
    });
  });
});
