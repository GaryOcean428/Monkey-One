import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ActivityMonitor } from '../../lib/core/ActivityMonitor';

describe('ActivityMonitor', () => {
  let activityMonitor: ActivityMonitor;

  beforeEach(() => {
    activityMonitor = new ActivityMonitor();
  });

  afterEach(() => {
    activityMonitor.cleanup();
  });

  it('should initialize with default state', () => {
    const state = activityMonitor.getState();
    expect(state.isLearning).toBe(false);
    expect(state.isProcessing).toBe(false);
    expect(state.activeRegions).toEqual([]);
    expect(state.lastActivity).toBeDefined();
  });

  it('should record activity correctly', () => {
    activityMonitor.recordActivity('learning');
    const state = activityMonitor.getState();
    expect(state.isLearning).toBe(true);
    expect(state.lastActivity).toBeGreaterThan(0);
  });

  it('should emit activity events', () => {
    const listener = vi.fn();
    activityMonitor.on('activity', listener);

    activityMonitor.recordActivity('processing');
    expect(listener).toHaveBeenCalledWith('processing');
  });

  it('should emit idle event after threshold', () => {
    vi.useFakeTimers();
    const idleListener = vi.fn();
    activityMonitor.on('idle', idleListener);

    activityMonitor.recordActivity('processing');
    vi.advanceTimersByTime(6000); // More than idle threshold

    expect(idleListener).toHaveBeenCalled();
    vi.useRealTimers();
  });

  it('should cleanup properly', () => {
    const listener = vi.fn();
    activityMonitor.on('activity', listener);
    
    activityMonitor.cleanup();
    activityMonitor.recordActivity('learning');
    
    expect(listener).not.toHaveBeenCalled();
  });
});
