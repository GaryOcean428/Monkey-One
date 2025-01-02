import { create } from 'zustand'
import type { Agent, AgentCapabilityType, Message } from '../lib/types/core'
import { AgentType, AgentStatus } from '../lib/types/core'

export interface AgentState {
  agents: Agent[]
  activeAgent: Agent | null
  addAgent: (agent: Omit<Agent, 'capabilities'> & { capabilities: AgentCapabilityType[] }) => void
  removeAgent: (id: string) => void
  setActiveAgent: (agent: Agent) => void
}

// Create default base agent
const defaultAgent: Agent = {
  id: 'base-1',
  name: 'Base Agent',
  type: AgentType.SPECIALIST,
  capabilities: new Set<AgentCapabilityType>(),
  status: AgentStatus.AVAILABLE,

  // Implement required Agent interface methods
  async initialize() {},
  async processMessage(message: Message) {
    return {
      id: 'response-' + message.id,
      type: 'ASSISTANT',
      content: '',
      timestamp: Date.now(),
    }
  },
  async handleRequest(_capability: string, _params: Record<string, unknown>) {
    return null
  },
  getCapabilities() {
    return []
  },
  hasCapability(type: AgentCapabilityType) {
    return this.capabilities.has(type)
  },
  addCapability(type: AgentCapabilityType) {
    this.capabilities.add(type)
  },
  removeCapability(type: AgentCapabilityType) {
    this.capabilities.delete(type)
  },
  validateParameters(_capability: string, _params: Record<string, unknown>) {},
  getMetrics() {
    return {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      lastResponseTime: 0,
      uptime: 0,
      memoryUsage: {
        heapUsed: 0,
        heapTotal: 0,
        external: 0,
        arrayBuffers: 0,
      },
    }
  },
  onMemoryCleanup(_handler: () => void) {},
  cleanupMemory() {},
  async shutdown() {},
}

export const useAgentStore = create<AgentState>(set => ({
  agents: [defaultAgent],
  activeAgent: defaultAgent,
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
