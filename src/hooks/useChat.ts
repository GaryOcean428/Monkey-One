import { useState, useCallback, useEffect } from 'react';
import { useChatStore } from '@/store/chatStore';
import { useAgentStore } from '@/store/agentStore';

export function useChat() {
  const {
    messages,
    tasks,
    activeTask,
    isProcessing,
    error: storeError,
    sendMessage: sendMessageToStore,
    approveTask,
    rejectTask
  } = useChatStore();

  const { activeAgent } = useAgentStore();
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (!activeAgent) {
      setLocalError(null);
    }
  }, [activeAgent]);

  const sendMessage = useCallback(async (content: string) => {
    if (!activeAgent) {
      setLocalError('Please select an agent to start chatting');
      return;
    }

    if (!content.trim()) {
      setLocalError('Message cannot be empty');
      return;
    }

    try {
      setLocalError(null);
      await sendMessageToStore(content, activeAgent.id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      setLocalError(errorMessage);
      throw err;
    }
  }, [activeAgent, sendMessageToStore]);

  const handleTaskAction = useCallback(async (taskId: string, action: 'approve' | 'reject') => {
    try {
      setLocalError(null);
      if (action === 'approve') {
        await approveTask(taskId);
      } else {
        await rejectTask(taskId);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process task action';
      setLocalError(errorMessage);
    }
  }, [approveTask, rejectTask]);

  return {
    messages,
    tasks,
    activeTask,
    isProcessing,
    error: localError || storeError,
    sendMessage,
    handleTaskAction,
    hasActiveAgent: Boolean(activeAgent)
  };
}