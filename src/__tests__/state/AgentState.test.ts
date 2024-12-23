import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AgentState } from '@/lib/state/AgentState';

describe('AgentState', () => {
  let state: AgentState;

  beforeEach(() => {
    vi.clearAllMocks();
    state = new AgentState();
  });

  describe('state registration', () => {
    it('should register new state configuration', () => {
      const config = {
        name: 'TEST',
        transitions: ['BUSY', 'ERROR'],
        timeout: 1000
      };
      state.registerState(config);
      expect(state.getCurrentState().name).toBe('TEST');
    });

    it('should throw error when registering duplicate state', () => {
      const config = {
        name: 'TEST',
        transitions: ['BUSY'],
        timeout: 1000
      };
      state.registerState(config);
      expect(() => state.registerState(config)).toThrow();
    });
  });

  describe('state transitions', () => {
    beforeEach(() => {
      state.registerState({
        name: 'IDLE',
        transitions: ['BUSY'],
        timeout: 1000
      });
      state.registerState({
        name: 'BUSY',
        transitions: ['IDLE', 'ERROR'],
        timeout: 1000
      });
    });

    it('should transition between allowed states', async () => {
      await state.transition('BUSY');
      expect(state.getCurrentState().name).toBe('BUSY');
    });

    it('should throw error for invalid transitions', async () => {
      await expect(state.transition('ERROR')).rejects.toThrow();
    });
  });

  describe('state timeout', () => {
    it('should transition to error state on timeout', async () => {
      vi.useFakeTimers();
      state.registerState({
        name: 'TEST',
        transitions: ['ERROR'],
        timeout: 100
      });
      state.setupStateTimeout();
      vi.advanceTimersByTime(200);
      expect(state.getCurrentState().name).toBe('ERROR');
      vi.useRealTimers();
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
