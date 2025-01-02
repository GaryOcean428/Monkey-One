import { expect, describe, it, beforeEach, vi } from 'vitest';
import { HandoffManager } from '../../../lib/workflow/agents/HandoffManager';
import { AgentType, AgentStatus, MessageType } from '../../../lib/types/core';

describe('HandoffManager', () => {
  let handoffManager: HandoffManager;
  
  beforeEach(() => {
    handoffManager = HandoffManager.getInstance();
  });

  describe('evaluateHandoff', () => {
    it('should detect required capabilities from message', async () => {
      const message = {
        id: 'test',
        type: MessageType.TASK,
        content: 'analyze this TypeScript code',
        role: 'user',
        timestamp: Date.now()
      };

      const result = await handoffManager.evaluateHandoff(message);
      expect(result.requiredCapabilities).toContain('code_analysis');
    });

    it('should return null if agent has required capability', async () => {
      const message = {
        id: 'test',
        type: MessageType.TASK,
        content: 'simple task',
        role: 'user',
        timestamp: Date.now()
      };

      const result = await handoffManager.evaluateHandoff(message, {
        id: 'test-agent',
        type: AgentType.SPECIALIST,
        capabilities: ['general_task'],
        status: AgentStatus.AVAILABLE
      });

      expect(result).toBeNull();
    });
  });

  describe('findBestAgent', () => {
    it('should find agent with matching capability', async () => {
      const agents = [{
        id: 'test-agent',
        type: AgentType.SPECIALIST,
        capabilities: ['code_analysis'],
        status: AgentStatus.AVAILABLE
      }];

      const result = await handoffManager.findBestAgent(['code_analysis'], agents);
      expect(result?.id).toBe('test-agent');
    });

    it('should return null if no matching agent found', async () => {
      const agents = [{
        id: 'test-agent',
        type: AgentType.SPECIALIST,
        capabilities: ['general_task'],
        status: AgentStatus.AVAILABLE
      }];

      const result = await handoffManager.findBestAgent(['code_analysis'], agents);
      expect(result).toBeNull();
    });
  });
});
