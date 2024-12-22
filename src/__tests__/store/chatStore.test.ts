import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { act } from '@testing-library/react';
import { useChatStore } from '@/store/chatStore';
import { llmManager } from '@/lib/llm/providers';
import { memoryManager } from '@/lib/memory';

// Mock dependencies
jest.mock('@/lib/llm/providers');
jest.mock('@/lib/memory');

describe('chatStore', () => {
  beforeEach(() => {
    useChatStore.setState({
      messages: [],
      tasks: [],
      activeTask: null,
      isProcessing: false,
      error: null,
      agents: [],
      activeAgent: null
    });
  });

  describe('sendMessage', () => {
    it('should add user message and process response', async () => {
      const mockResponse = 'Test response';
      (llmManager.sendMessage as jest.Mock).mockResolvedValue(mockResponse);

      const store = useChatStore.getState();
      store.setActiveAgent({
        id: 'test-agent',
        name: 'Test Agent',
        type: 'test',
        status: 'idle'
      });

      await act(async () => {
        await store.sendMessage('Test message');
      });

      const state = useChatStore.getState();
      expect(state.messages).toHaveLength(2);
      expect(state.messages[0].role).toBe('user');
      expect(state.messages[1].role).toBe('assistant');
      expect(state.messages[1].content).toBe(mockResponse);
    });

    it('should handle errors gracefully', async () => {
      const errorMessage = 'Test error';
      (llmManager.sendMessage as jest.Mock).mockRejectedValue(new Error(errorMessage));

      const store = useChatStore.getState();
      store.setActiveAgent({
        id: 'test-agent',
        name: 'Test Agent',
        type: 'test',
        status: 'idle'
      });

      await act(async () => {
        await store.sendMessage('Test message');
      });

      const state = useChatStore.getState();
      expect(state.error).toBe(errorMessage);
      expect(state.messages[0].status).toBe('error');
    });
  });

  // Add more test cases for other actions
});