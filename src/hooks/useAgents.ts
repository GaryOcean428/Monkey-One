import { useCallback } from 'react'
import { useAgentStore } from '../store/agentStore'
import type { Agent } from '@/lib/types/agent'

export function useAgents() {
  const { agents, activeAgent, setActiveAgent, updateAgentStatus } = useAgentStore()

  const handleAgentSelect = useCallback(
    (agent: Agent | null) => {
      setActiveAgent(agent)
    },
    [setActiveAgent]
  )

  return {
    agents,
    activeAgent,
    setActiveAgent: handleAgentSelect,
    updateAgentStatus,
  }
}
