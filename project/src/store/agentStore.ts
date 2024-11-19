import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { Agent, AgentMetrics } from '@/types';
import { createAgent as createAgentInstance } from '@/lib/agents';

interface CreateAgentParams {
  name: string;
  type: Agent['type'];
}

interface AgentState {
  agents: Agent[];
  activeAgent: Agent | null;
  metrics: Record<string, AgentMetrics>;
  isLoading: boolean;
  error: string | null;
}

interface AgentActions {
  initializeAgents: () => Promise<void>;
  setActiveAgent: (agent: Agent | null) => void;
  updateAgentStatus: (agentId: string, status: Agent['status']) => void;
  updateMetrics: (agentId: string, metrics: Partial<AgentMetrics>) => void;
  createAgent: (params: CreateAgentParams) => Promise<void>;
}

export const useAgentStore = create<AgentState & AgentActions>()(
  immer((set) => ({
    agents: [],
    activeAgent: null,
    metrics: {},
    isLoading: false,
    error: null,

    initializeAgents: async () => {
      set(state => {
        state.isLoading = true;
        state.error = null;
      });

      try {
        // Initialize default agents
        const defaultAgents: Agent[] = [
          {
            id: 'orchestrator-1',
            name: 'Orchestrator',
            type: 'orchestrator',
            status: 'idle',
            capabilities: ['task_planning', 'task_delegation']
          },
          {
            id: 'coder-1',
            name: 'Code Assistant',
            type: 'coder',
            status: 'idle',
            capabilities: ['code_generation', 'code_review']
          },
          {
            id: 'websurfer-1',
            name: 'Web Surfer',
            type: 'websurfer',
            status: 'idle',
            capabilities: ['web_search', 'data_extraction']
          }
        ];

        set(state => {
          state.agents = defaultAgents;
          state.activeAgent = defaultAgents[0];
          state.isLoading = false;
        });
      } catch (error) {
        set(state => {
          state.error = error instanceof Error ? error.message : 'Failed to initialize agents';
          state.isLoading = false;
        });
      }
    },

    createAgent: async (params) => {
      set(state => {
        state.isLoading = true;
        state.error = null;
      });

      try {
        const newAgent = createAgentInstance(params.type, {
          id: crypto.randomUUID(),
          name: params.name
        });

        set(state => {
          state.agents.push(newAgent);
          state.isLoading = false;
        });
      } catch (error) {
        set(state => {
          state.error = error instanceof Error ? error.message : 'Failed to create agent';
          state.isLoading = false;
        });
        throw error;
      }
    },

    setActiveAgent: (agent) => {
      set(state => {
        state.activeAgent = agent;
      });
    },

    updateAgentStatus: (agentId, status) => {
      set(state => {
        const agentIndex = state.agents.findIndex(a => a.id === agentId);
        if (agentIndex !== -1) {
          state.agents[agentIndex].status = status;
        }
      });
    },

    updateMetrics: (agentId, metrics) => {
      set(state => {
        state.metrics[agentId] = {
          ...state.metrics[agentId],
          ...metrics
        };
      });
    }
  }))
);