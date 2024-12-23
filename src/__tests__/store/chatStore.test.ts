import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act } from '@testing-library/react';
import { useChatStore } from '@/store/chatStore';
import { ResponseProcessor } from '@/lib/llm/ResponseProcessor';

// Mock dependencies
vi.mock('@/lib/llm/ResponseProcessor', () => ({
  ResponseProcessor: vi.fn().mockImplementation(() => ({
    processResponse: vi.fn().mockResolvedValue('Processed response')
  }))
}));

describe('chatStore', () => {
  beforeEach(() => {
    useChatStore.setState({
      messages: [],
      tasks: [],
      activeTask: null,
      isProcessing: false,
      error: null
    });
    vi.clearAllMocks();
  });

  describe('sendMessage', () => {
    it('should add user message and process response', async () => {
      const store = useChatStore.getState();
      const testAgentId = 'test-agent';

      await act(async () => {
        await store.sendMessage('Test message', testAgentId);
      });

      const state = useChatStore.getState();
      expect(state.messages).toHaveLength(1); // Only user message since response processing is mocked
      expect(state.messages[0].role).toBe('user');
      expect(state.messages[0].content).toBe('Test message');
      expect(state.isProcessing).toBe(false);
    });

    it('should handle errors gracefully', async () => {
      vi.mocked(ResponseProcessor).mockImplementation(() => ({
        processResponse: vi.fn().mockRejectedValue(new Error('Test error'))
      }));

      const store = useChatStore.getState();
      const testAgentId = 'test-agent';

      await act(async () => {
        await store.sendMessage('Test message', testAgentId);
      });

      const state = useChatStore.getState();
      expect(state.error).toBe('Test error');
      expect(state.isProcessing).toBe(false);
    });
  });

  describe('clearMessages', () => {
    it('should clear all messages', () => {
      const store = useChatStore.getState();
      
      // Add a test message
      store.messages.push({
        id: '1',
        role: 'user',
        content: 'Test message',
        timestamp: Date.now(),
        status: 'sent'
      });

      expect(store.messages).toHaveLength(1);

      // Clear messages
      store.clearMessages();

      expect(store.messages).toHaveLength(0);
    });
  });
});