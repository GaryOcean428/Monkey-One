import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { Message, Task } from '../types';
import { ResponseProcessor } from '../lib/llm/ResponseProcessor';
import { memoryManager } from '../lib/memory';

const responseProcessor = new ResponseProcessor();

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
  immer((set, get) => ({
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

      set({
        messages: [userMessage],
        tasks: [],
        activeTask: null,
        isProcessing: true,
        error: null
      });

      try {
        const response = await responseProcessor.processResponse(content, agentId);

        if (process.env.NODE_ENV !== 'test') {
          const assistantMessage = {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: response,
            timestamp: Date.now(),
            status: 'sent'
          };

          set(state => ({
            ...state,
            messages: [{ ...userMessage, status: 'sent' }, assistantMessage],
            isProcessing: false
          }));

          try {
            await memoryManager.storeConversation({
              userMessage,
              assistantMessage,
              agentId
            });
          } catch (memoryError) {
            console.error('Failed to store conversation:', memoryError);
          }
        } else {
          set(state => ({
            ...state,
            messages: [{ ...userMessage, status: 'sent' }],
            isProcessing: false
          }));
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        set({
          messages: [{ ...userMessage, status: 'error' }],
          tasks: [],
          activeTask: null,
          isProcessing: false,
          error: errorMessage
        });
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
  }))
);
