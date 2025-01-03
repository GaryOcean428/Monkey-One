import { useCallback } from 'react'
import { useChatStore } from '../store/chatStore'
import { useAgentStore } from '../store/agentStore'
import type { Agent } from '../lib/types/agent'

export const DEFAULT_COMMANDS = [
  '/help',
  '/clear',
  '/status',
  '/settings',
  '/workflow',
  '/memory',
  '/performance',
] as const

export type Command = (typeof DEFAULT_COMMANDS)[number]

export type OnStreamCallback = (chunk: string) => void

export function useChat() {
  const {
    messages,
    tasks,
    activeTask,
    isProcessing,
    error,
    sendMessage,
    clearMessages,
    approveTask,
  } = useChatStore()
  const { activeAgent, setActiveAgent } = useAgentStore()

  const handleSendMessage = useCallback(
    async (content: string, onStream?: OnStreamCallback) => {
      if (!activeAgent) {
        throw new Error('No active agent selected')
      }
      try {
        await sendMessage(content, activeAgent.getId(), onStream)
      } catch (error) {
        console.error('Failed to send message:', error)
        throw error
      }
    },
    [activeAgent, sendMessage]
  )

  const handleApproveTask = useCallback(
    async (taskId: string) => {
      await approveTask(taskId)
    },
    [approveTask]
  )

  const handleClearChat = useCallback(() => {
    clearMessages()
  }, [clearMessages])

  const handleSetActiveAgent = useCallback(
    (agent: Agent) => {
      setActiveAgent(agent)
    },
    [setActiveAgent]
  )

  return {
    messages,
    tasks,
    activeTask,
    isProcessing,
    error,
    sendMessage: handleSendMessage,
    approveTask: handleApproveTask,
    clearChat: handleClearChat,
    setActiveAgent: handleSetActiveAgent,
    hasActiveAgent: !!activeAgent,
    availableCommands: DEFAULT_COMMANDS,
  }
}
