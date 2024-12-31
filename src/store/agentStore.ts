import { create } from 'zustand';
import type { Agent } from '../lib/types/core';

interface AgentState {
  activeAgent: Agent | null;
  setActiveAgent: (agent: Agent) => void;
}

export const useAgentStore = create<AgentState>((set) => ({
  activeAgent: null,
  setActiveAgent: (agent) => set({ activeAgent: agent }),
}));