import { describe, it, expect, beforeEach } from 'vitest';
import { BrainstemAgent } from '../../lib/agents/core/BrainstemAgent';
import { Message, MessageType } from '../../types';

describe('BrainstemAgent', () => {
  let agent: BrainstemAgent;

  beforeEach(() => {
    agent = new BrainstemAgent('test-id', 'Test Brainstem');
  });

  it('should initialize with correct capabilities', () => {
    expect(agent.getCapabilities()).toEqual([
      'vital_regulation',
      'arousal_control',
      'reflex_coordination',
      'homeostasis'
    ]);
  });

  it('should process messages and update system state', async () => {
    const message: Message = {
      id: 'test-1',
      type: MessageType.TASK,
      role: 'user', 
      content: 'urgent test message',
      timestamp: Date.now()
    };

    const response = await agent.processMessage(message);
    expect(response.content).toContain('System operating at elevated alertness');
  });
});
