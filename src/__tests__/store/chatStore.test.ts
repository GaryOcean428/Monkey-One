import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act } from '@testing-library/react';
import { useChatStore } from '@/store/chatStore';
import { llmManager } from '@/lib/llm/providers';

// Mock dependencies
vi.mock('@/lib/llm/providers');

describe('chatStore', () => {
  beforeEach(() => {
    useChatStore.setState({
      messages: [],
      tasks: [],
      activeTask: null,
      isProcessing: false,
      error: null
    });
  });

  describe('sendMessage', () => {
    it('should add user message and process response', async () => {
      const mockResponse = 'Test response';
      vi.mocked(llmManager.sendMessage).mockResolvedValue(mockResponse);

      const store = useChatStore.getState();
      const testAgentId = 'test-agent';

      await act(async () => {
        await store.sendMessage('Test message', testAgentId);
      });

      const state = useChatStore.getState();
      expect(state.messages).toHaveLength(2);
      expect(state.messages[0].role).toBe('user');
      expect(state.messages[1].role).toBe('assistant');
      expect(state.messages[1].content).toBe(mockResponse);
    });

    it('should handle errors gracefully', async () => {
      const errorMessage = 'Test error';
      vi.mocked(llmManager.sendMessage).mockRejectedValue(new Error(errorMessage));
      const testAgentId = 'test-agent';

      const store = useChatStore.getState();

      await act(async () => {
        await store.sendMessage('Test message', testAgentId);
      });

      const state = useChatStore.getState();
      expect(state.error).toBe(errorMessage);
    });
  });

  describe('clearMessages', () => {
    it('should clear all messages', () => {
      const store = useChatStore.getState();
      store.messages.push({ 
        id: '1', 
        role: 'user', 
        content: 'test',
        timestamp: Date.now(),
        status: 'sent'
      });

      store.clearMessages();
      expect(store.messages).toHaveLength(0);
    });
  });
});