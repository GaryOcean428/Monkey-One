import { create } from 'zustand'
import type { Agent } from '../lib/types/core'

export interface AgentState {
  agents: Agent[]
  activeAgent: Agent | null
  addAgent: (agent: Omit<Agent, 'capabilities'> & { capabilities: string[] }) => void
  removeAgent: (id: string) => void
  setActiveAgent: (agent: Agent) => void
}

export const useAgentStore = create<AgentState>(set => ({
  agents: [],
  activeAgent: null,
  addAgent: agent =>
    set(state => ({
      agents: [
        ...state.agents,
        {
          ...agent,
          capabilities: new Set(agent.capabilities),
        },
      ],
    })),
  removeAgent: id =>
    set(state => ({
      agents: state.agents.filter(a => a.id !== id),
      activeAgent: state.activeAgent?.id === id ? null : state.activeAgent,
    })),
  setActiveAgent: agent => set({ activeAgent: agent }),
}))
