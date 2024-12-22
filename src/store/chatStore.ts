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
        const recentMessages = get().messages.slice(-5);
        const processedResponse = await responseProcessor.processResponse(
          content,
          recentMessages
        );

        await memoryManager.add({
          type: 'conversation',
          content: JSON.stringify({
            userMessage,
            response: processedResponse,
            agentId,
          }),
          tags: ['chat', 'conversation'],
        });

        set((state) => {
          const msgIndex = state.messages.findIndex((m) => m.id === userMessage.id);
          if (msgIndex !== -1) {
            state.messages[msgIndex].status = 'sent';
          }

          state.messages.push({
            id: crypto.randomUUID(),
            role: 'assistant',
            content: processedResponse.content,
            timestamp: Date.now(),
            status: 'sent',
            metadata: {
              agentId,
              confidence: processedResponse.confidence,
              context: processedResponse.context,
              ...processedResponse.metadata,
            },
          });

          state.isProcessing = false;
          state.error = null;
        });
      } catch (error) {
        console.error('Error processing message:', error);
        set((state) => {
          const msgIndex = state.messages.findIndex((m) => m.id === userMessage.id);
          if (msgIndex !== -1) {
            state.messages[msgIndex].status = 'error';
          }
          state.error =
            error instanceof Error ? error.message : 'Failed to process message';
          state.isProcessing = false;
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
        const taskIndex = state.tasks.findIndex((t) => t.id === taskId);
        if (taskIndex !== -1) {
          state.tasks[taskIndex].status = 'completed';
          state.tasks[taskIndex].completedTime = Date.now();
        }
      });
    },

    rejectTask: async (taskId: string) => {
      set((state) => {
        const taskIndex = state.tasks.findIndex((t) => t.id === taskId);
        if (taskIndex !== -1) {
          state.tasks[taskIndex].status = 'rejected';
        }
      });
    },
  }))
);
