import { useCallback } from "react";
import { useChatStore } from "../store/chatStore";
import { useAgentStore } from "../store/agentStore";

export function useChat() {
  const { messages, tasks, activeTask, isProcessing, error, sendMessage, clearMessages, approveTask, rejectTask } = useChatStore();
  const { activeAgent } = useAgentStore();

  const handleSendMessage = useCallback(async (content: string) => {
    if (!activeAgent) {
      throw new Error('No active agent selected');
    }
    await sendMessage(content, activeAgent.id);
  }, [activeAgent, sendMessage]);

  const handleApproveTask = useCallback(async (taskId: string) => {
    await approveTask(taskId);
  }, [approveTask]);

  const handleRejectTask = useCallback(async (taskId: string) => {
    await rejectTask(taskId);
  }, [rejectTask]);

  const handleClearChat = useCallback(() => {
    clearMessages();
  }, [clearMessages]);

  return {
    messages,
    tasks,
    activeTask,
    isLoading: isProcessing,
    error,
    sendMessage: handleSendMessage,
    approveTask: handleApproveTask,
    rejectTask: handleRejectTask,
    clearChat: handleClearChat
  };
}