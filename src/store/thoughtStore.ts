import { create } from 'zustand';

interface Thought {
  type: string;
  content: string;
  timestamp: Date;
}

interface ThoughtStore {
  thoughts: Thought[];
  addThought: (thought: Omit<Thought, 'timestamp'>) => void;
  clearThoughts: () => void;
}

export const useThoughtStore = create<ThoughtStore>((set) => ({
  thoughts: [],
  addThought: (thought) =>
    set((state) => ({
      thoughts: [
        ...state.thoughts,
        {
          ...thought,
          timestamp: new Date(),
        },
      ],
    })),
  clearThoughts: () => set({ thoughts: [] }),
}));
