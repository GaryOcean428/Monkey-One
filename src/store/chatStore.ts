import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { MessageType } from '../types'
import type { Message, TaskData } from '../types'
import { ResponseProcessor } from '../lib/llm/ResponseProcessor'

type OnStreamCallback = (chunk: string) => void

interface ChatState {
  messages: Message[]
  tasks: TaskData[]
  activeTask: TaskData | null
  isProcessing: boolean
  error: string | null
  onStreamCallback: OnStreamCallback | null
}

interface ChatActions {
  sendMessage: (content: string, agentId: string, onStream?: OnStreamCallback) => Promise<void>
  clearMessages: () => void
  approveTask: (taskId: string) => Promise<void>
  rejectTask: (taskId: string) => Promise<void>
}

// Extend Message type to include metadata
interface ExtendedMessage extends Message {
  metadata?: {
    processingTime: number
    tokensUsed: number
    model: string
  }
}

export const useChatStore = create<ChatState & ChatActions>()(
  immer((set, get) => {
    const responseProcessor = new ResponseProcessor()

    // Set up streaming event handler
    responseProcessor.on('chunk', (chunk: string) => {
      const onStream = get().onStreamCallback
      if (onStream) {
        onStream(chunk)
      }
    })

    return {
      messages: [],
      tasks: [],
      activeTask: null,
      isProcessing: false,
      error: null,
      onStreamCallback: null,

      sendMessage: async (content: string, agentId: string, onStream?: OnStreamCallback) => {
        if (!content.trim()) return

        const userMessage: ExtendedMessage = {
          id: globalThis.crypto.randomUUID(),
          type: MessageType.USER,
          content,
          timestamp: Date.now(),
          status: 'sending',
          role: 'user',
        }

        set(state => {
          state.messages.push(userMessage)
          state.isProcessing = true
          state.error = null
          state.onStreamCallback = onStream || null
        })

        try {
          const previousMessages = get().messages
          const response = await responseProcessor.processResponse(
            content,
            agentId,
            previousMessages
          )

          if (response.content) {
            const assistantMessage: ExtendedMessage = {
              id: globalThis.crypto.randomUUID(),
              type: MessageType.RESPONSE,
              content: response.content,
              timestamp: Date.now(),
              status: 'sent',
              role: 'assistant',
              metadata: {
                processingTime: response.metadata.processingTime,
                tokensUsed: response.metadata.tokensUsed,
                model: response.metadata.model,
              },
            }

            set(state => {
              const userIndex = state.messages.findIndex(m => m.id === userMessage.id)
              if (userIndex !== -1) {
                state.messages[userIndex].status = 'sent'
              }
              state.messages.push(assistantMessage)
              state.isProcessing = false
              state.onStreamCallback = null
            })
          } else {
            set(state => {
              const userIndex = state.messages.findIndex(m => m.id === userMessage.id)
              if (userIndex !== -1) {
                state.messages[userIndex].status = 'sent'
              }
              state.isProcessing = false
              state.onStreamCallback = null
            })
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
          set(state => {
            const userIndex = state.messages.findIndex(m => m.id === userMessage.id)
            if (userIndex !== -1) {
              state.messages[userIndex].status = 'error'
            }
            state.isProcessing = false
            state.error = errorMessage
            state.onStreamCallback = null
          })
        }
      },

      clearMessages: () => {
        set(state => {
          state.messages = []
          state.tasks = []
          state.activeTask = null
          state.isProcessing = false
          state.error = null
          state.onStreamCallback = null
        })
      },

      approveTask: async (taskId: string) => {
        set(state => {
          const task = state.tasks.find((t: TaskData) => t.id === taskId)
          if (task) {
            task.status = 'approved'
          }
        })
      },

      rejectTask: async (taskId: string) => {
        set(state => {
          const task = state.tasks.find((t: TaskData) => t.id === taskId)
          if (task) {
            task.status = 'rejected'
          }
        })
      },
    }
  })
)
