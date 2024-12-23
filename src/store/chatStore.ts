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

      set((state) => {
        state.isProcessing = true;
        state.error = null;
      });

      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: 'user',
        content,
        timestamp: Date.now(),
        status: 'sending',
      };

      set((state) => {
        state.messages.push(userMessage);
      });

      try {
        const response = await responseProcessor.processResponse(content, agentId);

        const assistantMessage: Message = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: response,
          timestamp: Date.now(),
          status: 'sent',
        };

        set((state) => {
          state.messages[state.messages.length - 1].status = 'sent';
          state.messages.push(assistantMessage);
          state.isProcessing = false;
        });

        // Store conversation in memory
        await memoryManager.storeConversation({
          userMessage,
          assistantMessage,
          agentId,
        });

      } catch (error) {
        set((state) => {
          state.error = error instanceof Error ? error.message : 'An unknown error occurred';
          state.isProcessing = false;
          if (state.messages.length > 0) {
            state.messages[state.messages.length - 1].status = 'error';
          }
        });
      }
    },

    clearMessages: () => {
      set((state) => {
        state.messages = [];
        state.error = null;
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
