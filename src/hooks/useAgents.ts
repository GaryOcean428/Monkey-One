import { useCallback, useEffect } from 'react'
import { useAgentStore } from '../store/agentStore'
import type { Agent } from '../types'

export function useAgents() {
  const {
    agents,
    activeAgent,
    metrics,
    isLoading,
    error,
    initializeAgents,
    setActiveAgent,
    updateAgentStatus,
    updateMetrics,
  } = useAgentStore()

  useEffect(() => {
    initializeAgents()
  }, [initializeAgents])

  const handleAgentSelect = useCallback(
    (agent: Agent | null) => {
      setActiveAgent(agent)
    },
    [setActiveAgent]
  )

  return {
    agents,
    activeAgent,
    metrics,
    isLoading,
    error,
    setActiveAgent: handleAgentSelect,
    updateAgentStatus,
    updateMetrics,
  }
}
