import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { Message, Task } from '../types';
import { ResponseProcessor } from '../lib/llm/ResponseProcessor';
import { memoryManager } from '../lib/memory';

interface ChatState {
  messages: Message[];
  tasks: Task[];
  activeTask: Task | null;
  isProcessing: boolean;
  error: string | null;
}

interface ChatActions {
  sendMessage: (content: string, agentId: string) => Promise<void>;
  clearMessages: () => void;
  approveTask: (taskId: string) => Promise<void>;
  rejectTask: (taskId: string) => Promise<void>;
}

export const useChatStore = create<ChatState & ChatActions>()(
  immer((set, get) => {
    // Initialize ResponseProcessor instance for better testability
    const responseProcessor = new ResponseProcessor();

    return {
      messages: [],
      tasks: [],
      activeTask: null,
      isProcessing: false,
      error: null,

      sendMessage: async (content: string, agentId: string) => {
        if (!content.trim()) return;

        const userMessage = {
          id: crypto.randomUUID(),
          role: 'user',
          content,
          timestamp: Date.now(),
          status: 'sending'
        };

        set((state) => ({
          messages: [...state.messages, userMessage],
          isProcessing: true,
          error: null
        }));

        try {
          // Get previous messages for context
          const previousMessages = get().messages;
          const response = await responseProcessor.processResponse(content, agentId, previousMessages);

          if (response.content) {
            const assistantMessage = {
              id: crypto.randomUUID(),
              role: 'assistant',
              content: response.content,
              timestamp: Date.now(),
              status: 'sent',
              metadata: response.metadata
            };

            set(state => ({
              messages: [...state.messages, { ...userMessage, status: 'sent' }, assistantMessage],
              isProcessing: false
            }));

          } else {
            set(state => ({
              messages: [...state.messages, { ...userMessage, status: 'sent' }],
              isProcessing: false
            }));
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
          set(state => ({
            messages: [...state.messages, { ...userMessage, status: 'error' }],
            isProcessing: false,
            error: errorMessage
          }));
        }
      },

      clearMessages: () => {
        set({
          messages: [],
          tasks: [],
          activeTask: null,
          isProcessing: false,
          error: null
        });
      },

      approveTask: async (taskId: string) => {
        set((state) => {
          const task = state.tasks.find((t) => t.id === taskId);
          if (task) {
            task.status = 'approved';
          }
        });
      },

      rejectTask: async (taskId: string) => {
        set((state) => {
          const task = state.tasks.find((t) => t.id === taskId);
          if (task) {
            task.status = 'rejected';
          }
        });
      },
    };
  })
);
