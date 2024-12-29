import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act } from 'react';  // Import from react instead of react-dom/test-utils
import { useChatStore } from '../../store/chatStore';
import { ResponseProcessor } from '../../lib/llm/ResponseProcessor';

// Mock dependencies
vi.mock('../../lib/llm/ResponseProcessor', () => ({
  ResponseProcessor: vi.fn().mockImplementation(() => ({
    processResponse: vi.fn().mockResolvedValue('Processed response')
  }))
}));

vi.mock('../../lib/memory', () => ({
  memoryManager: {
    storeConversation: vi.fn().mockResolvedValue(undefined)
  }
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
      const mockError = new Error('Test error');
      const mockResponseProcessor = {
        processResponse: vi.fn().mockRejectedValue(mockError)
      };
      vi.mocked(ResponseProcessor).mockImplementation(() => mockResponseProcessor);

      const store = useChatStore.getState();
      const testAgentId = 'test-agent';

      await act(async () => {
        await store.sendMessage('Test message', testAgentId);
      });

      const state = useChatStore.getState();
      expect(state.error).toBe(mockError.message);
      expect(state.isProcessing).toBe(false);
      expect(state.messages[0].status).toBe('error');
    });
  });

  describe('clearMessages', () => {
    it('should clear all messages', async () => {
      const store = useChatStore.getState();
      
      // Set initial state with a message
      set(store, {
        messages: [{
          id: '1',
          role: 'user',
          content: 'Test message',
          timestamp: Date.now(),
          status: 'sent'
        }]
      });

      expect(store.messages).toHaveLength(1);

      // Clear messages
      store.clearMessages();

      expect(store.messages).toHaveLength(0);
    });
  });
});