import { useCallback } from "react";
import { useChatStore } from "../store/chatStore";
import { useAgentStore } from "../store/agentStore";
import { Agent } from "../lib/types/core";

export function useChat() {
  const { messages, tasks, activeTask, isProcessing, error, sendMessage, clearMessages, approveTask, rejectTask } = useChatStore();
  const { activeAgent, setActiveAgent } = useAgentStore();

  const handleSendMessage = useCallback(async (content: string) => {
    if (!activeAgent) {
      throw new Error('No active agent selected');
    }
    try {
      await sendMessage(content, activeAgent.id);
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
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

  const handleSetActiveAgent = useCallback((agent: Agent) => {
    setActiveAgent(agent);
  }, [setActiveAgent]);

  return {
    messages,
    tasks,
    activeTask,
    isLoading: isProcessing,
    error,
    sendMessage: handleSendMessage,
    approveTask: handleApproveTask,
    rejectTask: handleRejectTask,
    clearChat: handleClearChat,
    setActiveAgent: handleSetActiveAgent,
    hasActiveAgent: !!activeAgent
  };
}