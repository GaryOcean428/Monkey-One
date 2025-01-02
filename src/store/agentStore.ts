import { create } from 'zustand'
import type { Agent, AgentCapabilityType } from '../lib/types/core'

export interface AgentState {
  agents: Agent[]
  activeAgent: Agent | null
  addAgent: (agent: Omit<Agent, 'capabilities'> & { capabilities: AgentCapabilityType[] }) => void
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
          capabilities: new Set<AgentCapabilityType>(agent.capabilities),
        } as Agent,
      ],
    })),
  removeAgent: id =>
    set(state => ({
      agents: state.agents.filter(a => a.id !== id),
      activeAgent: state.activeAgent?.id === id ? null : state.activeAgent,
    })),
  setActiveAgent: agent => set({ activeAgent: agent }),
}))
