import { create } from 'zustand';

interface Tool {
  id: string;
  name: string;
  type: string;
  createdAt: Date;
}

interface ToolState {
  tools: Tool[];
  isLoading: boolean;
  error: Error | null;
  createTool: (tool: Pick<Tool, 'name' | 'type'>) => Promise<void>;
  deleteTool: (id: string) => Promise<void>;
  fetchTools: () => Promise<void>;
}

export const useToolStore = create<ToolState>((set, get) => ({
  tools: [],
  isLoading: false,
  error: null,

  createTool: async (tool) => {
    set({ isLoading: true, error: null });
    try {
      // TODO: Replace with actual API call
      const newTool: Tool = {
        id: crypto.randomUUID(),
        name: tool.name,
        type: tool.type,
        createdAt: new Date(),
      };
      set((state) => ({ tools: [...state.tools, newTool] }));
    } catch (error) {
      set({ error: error as Error });
    } finally {
      set({ isLoading: false });
    }
  },

  deleteTool: async (id) => {
    set({ isLoading: true, error: null });
    try {
      // TODO: Replace with actual API call
      set((state) => ({
        tools: state.tools.filter((tool) => tool.id !== id),
      }));
    } catch (error) {
      set({ error: error as Error });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchTools: async () => {
    set({ isLoading: true, error: null });
    try {
      // TODO: Replace with actual API call
      const tools: Tool[] = [];
      set({ tools });
    } catch (error) {
      set({ error: error as Error });
    } finally {
      set({ isLoading: false });
    }
  },
}));
