import { renderHook, act } from '@testing-library/react';
import { AgentType, AgentStatus } from '@/types';
import { useChat } from '@/hooks/useChat';
import { useChatStore } from '@/store/chatStore';
import { useAgentStore } from '@/store/agentStore';

// Mock the stores
jest.mock('@/store/chatStore');
jest.mock('@/store/agentStore');

describe('useChat', () => {
  beforeEach(() => {
    // Reset store states
    useChatStore.setState({
      messages: [],
      tasks: [],
      activeTask: null,
      isProcessing: false,
      error: null
    });

    useAgentStore.setState({
      activeAgent: null
    });
  });

  it('should throw error when no active agent is selected', async () => {
    const { result } = renderHook(() => useChat());

    await act(async () => {
      await expect(result.current.sendMessage('test')).rejects.toThrow('No active agent selected');
    });
  });

  it('should send message when active agent is selected', async () => {
    useAgentStore.setState({
      activeAgent: {
        id: 'test-agent',
        name: 'Test Agent',
        type: AgentType.ORCHESTRATOR,
        status: AgentStatus.IDLE
      }
    });

    const { result } = renderHook(() => useChat());

    await act(async () => {
      await result.current.sendMessage('test');
    });

    expect(useChatStore.getState().messages).toHaveLength(2);
  });

  // Add more test cases
});