import { create } from 'zustand'
import type { Agent, AgentCapabilityType, MessageResponse, AgentMetrics } from '../lib/types/agent'
import { AgentType, AgentStatus } from '../lib/types/agent'

interface AgentInput {
  id: string
  name: string
  type: AgentType
  status?: AgentStatus
  capabilities: AgentCapabilityType[]
}

export interface AgentState {
  agents: Agent[]
  activeAgent: Agent | null
  addAgent: (agent: AgentInput) => void
  removeAgent: (id: string) => void
  setActiveAgent: (agent: Agent | null) => void
  getAvailableAgents: () => Agent[]
  updateAgentStatus: (agentId: string, status: AgentStatus) => void
}

// Create default base agent
const defaultAgent: Agent = {
  getId() {
    return 'base-1'
  },
  getName() {
    return 'Base Agent'
  },
  getType() {
    return AgentType.BASE
  },
  getStatus() {
    return AgentStatus.IDLE
  },
  getCapabilities() {
    return []
  },
  hasCapability() {
    return false
  },
  addCapability() {},
  removeCapability() {},
  getMetrics(): AgentMetrics {
    return {
      lastExecutionTime: 0,
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
    }
  },
  async handleMessage() {
    return { success: true }
  },
  async handleRequest(request: unknown) {
    return request
  },
  async handleToolUse(): Promise<MessageResponse> {
    return {
      status: 'success',
      data: null,
    }
  },
}

export const useAgentStore = create<AgentState>((set, get) => ({
  agents: [defaultAgent],
  activeAgent: defaultAgent,
  addAgent: agent =>
    set(state => ({
      agents: [
        ...state.agents,
        {
          getId: () => agent.id,
          getName: () => agent.name,
          getType: () => agent.type,
          getStatus: () => agent.status || AgentStatus.IDLE,
          getCapabilities: () => agent.capabilities,
          hasCapability: cap => agent.capabilities.some(c => c.name === cap.name),
          addCapability: () => {},
          removeCapability: () => {},
          getMetrics: () => ({
            lastExecutionTime: 0,
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            averageResponseTime: 0,
          }),
          handleMessage: async () => ({ success: true }),
          handleRequest: async req => req,
          handleToolUse: async () => ({ status: 'success' as const, data: null }),
        } as Agent,
      ],
    })),
  removeAgent: id =>
    set(state => ({
      agents: state.agents.filter(a => a.getId() !== id),
      activeAgent: state.activeAgent?.getId() === id ? null : state.activeAgent,
    })),
  setActiveAgent: agent => set({ activeAgent: agent }),
  getAvailableAgents: () => {
    const { agents } = get()
    return agents.filter(agent => agent.getStatus() === AgentStatus.IDLE)
  },
  updateAgentStatus: (agentId, status) =>
    set(state => ({
      agents: state.agents.map(agent =>
        agent.getId() === agentId
          ? ({
              ...agent,
              getStatus: () => status,
            } as Agent)
          : agent
      ),
    })),
}))
