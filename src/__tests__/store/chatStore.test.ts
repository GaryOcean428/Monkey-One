// Import vi first
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act } from 'react';

// Mock dependencies before any imports that use them
vi.mock('../../lib/llm/ResponseProcessor', () => {
  return {
    ResponseProcessor: vi.fn().mockImplementation(() => ({
      processResponse: vi.fn().mockResolvedValue('Processed response')
    }))
  };
});

vi.mock('../../lib/memory', () => ({
  memoryManager: {
    storeConversation: vi.fn().mockResolvedValue(undefined)
  }
}));

// Import after mocks
import { useChatStore } from '../../store/chatStore';
import { ResponseProcessor } from '../../lib/llm/ResponseProcessor';

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
    
    // Reset the mock implementation for each test
    vi.mocked(ResponseProcessor).mockImplementation(() => ({
      processResponse: vi.fn().mockResolvedValue('Processed response')
    }));
  });

  describe('sendMessage', () => {
    it('should add user message and process response', async () => {
      const store = useChatStore.getState();
      const testAgentId = 'test-agent';

      await act(async () => {
        await store.sendMessage('Test message', testAgentId);
      });

      const state = useChatStore.getState();
      const mockInstance = vi.mocked(new ResponseProcessor());
      expect(mockInstance.processResponse).toHaveBeenCalled();
      expect(state.messages).toHaveLength(1);
      expect(state.messages[0].role).toBe('user');
      expect(state.messages[0].content).toBe('Test message');
      expect(state.isProcessing).toBe(false);
    });

    it('should handle errors gracefully', async () => {
      // Setup error case
      const mockError = new Error('Test error');
      vi.mocked(ResponseProcessor).mockImplementation(() => ({
        processResponse: vi.fn().mockRejectedValueOnce(mockError)
      }));

      const store = useChatStore.getState();
      const testAgentId = 'test-agent';

      await act(async () => {
        await store.sendMessage('Test message', testAgentId);
      });

      const state = useChatStore.getState();
      const mockInstance = vi.mocked(new ResponseProcessor());
      expect(mockInstance.processResponse).toHaveBeenCalled();
      expect(state.error).toBe('Test error');
      expect(state.isProcessing).toBe(false);
      expect(state.messages[0].status).toBe('error');
    });
  });

  describe('clearMessages', () => {
    it('should clear all messages', async () => {
      const store = useChatStore.getState();
      
      // Add a test message through the store's setState
      useChatStore.setState({
        ...store,
        messages: [{
          id: '1',
          role: 'user',
          content: 'Test message',
          timestamp: Date.now(),
          status: 'sent'
        }]
      });

      expect(useChatStore.getState().messages).toHaveLength(1);

      // Clear messages
      store.clearMessages();

      expect(useChatStore.getState().messages).toHaveLength(0);
    });
  });
});