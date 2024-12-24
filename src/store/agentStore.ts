import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { Agent } from '../types';

interface AgentMetrics {
  messagesProcessed: number;
  averageResponseTime: number;
  successRate: number;
}

interface AgentState {
  agents: Agent[];
  activeAgent: Agent | null;
  metrics: AgentMetrics;
  isLoading: boolean;
  error: string | null;
  initializeAgents: () => Promise<void>;
  setActiveAgent: (agent: Agent | null) => void;
  addAgent: (agent: Agent) => void;
  removeAgent: (agentId: string) => void;
  updateAgentStatus: (agentId: string, status: Agent['status']) => void;
  updateMetrics: (metrics: Partial<AgentMetrics>) => void;
}

const initialMetrics: AgentMetrics = {
  messagesProcessed: 0,
  averageResponseTime: 0,
  successRate: 0
};

const defaultAgents: Agent[] = [
  {
    id: 'default-assistant',
    name: 'AI Assistant',
    description: 'A helpful AI assistant that can answer questions and help with tasks.',
    status: 'available',
    capabilities: ['chat', 'task-execution', 'code-assistance'],
    model: 'gpt-4',
    systemPrompt: 'You are a helpful AI assistant.',
  }
];

export const useAgentStore = create<AgentState>()(
  immer((set) => ({
    agents: [],
    activeAgent: null,
    metrics: initialMetrics,
    isLoading: false,
    error: null,

    initializeAgents: async () => {
      set((state) => { state.isLoading = true; state.error = null; });
      try {
        // Load default agents
        set((state) => { 
          state.agents = defaultAgents;
          // Set the first agent as active by default
          if (defaultAgents.length > 0 && !state.activeAgent) {
            state.activeAgent = defaultAgents[0];
          }
          state.isLoading = false;
        });
      } catch (error) {
        set((state) => {
          state.isLoading = false;
          state.error = error instanceof Error ? error.message : 'Failed to initialize agents';
        });
      }
    },

    setActiveAgent: (agent) => {
      set((state) => { state.activeAgent = agent; });
    },

    addAgent: (agent) => {
      set((state) => { state.agents.push(agent); });
    },

    removeAgent: (agentId) => {
      set((state) => {
        state.agents = state.agents.filter(a => a.id !== agentId);
        if (state.activeAgent?.id === agentId) {
          state.activeAgent = null;
        }
      });
    },

    updateAgentStatus: (agentId, status) => {
      set((state) => {
        const agent = state.agents.find(a => a.id === agentId);
        if (agent) {
          agent.status = status;
          if (state.activeAgent?.id === agentId) {
            state.activeAgent = agent;
          }
        }
      });
    },

    updateMetrics: (newMetrics) => {
      set((state) => {
        state.metrics = { ...state.metrics, ...newMetrics };
      });
    }
  }))
);