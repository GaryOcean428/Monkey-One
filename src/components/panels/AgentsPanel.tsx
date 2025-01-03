import React from 'react'
import { Panel } from '../ui/Panel'
import { AgentType, AgentStatus } from '../../lib/types/agent'
import type { Agent, AgentCapabilityType } from '../../lib/types/agent'

interface AgentDisplay {
  id: string
  name: string
  type: AgentType
  status: AgentStatus
  capabilities: AgentCapabilityType[]
  lastActive?: number
}

interface AgentsPanelProps {
  agents: Agent[]
  loading?: boolean
  error?: string
  onRefresh?: () => void
  onAgentClick?: (agent: Agent) => void
}

function agentToDisplay(agent: Agent): AgentDisplay {
  return {
    id: agent.getId(),
    name: agent.constructor.name,
    type: agent.getType(),
    status: agent.getStatus(),
    capabilities: agent.getCapabilities(),
    lastActive: agent.getMetrics().lastExecutionTime,
  }
}

export function AgentsPanel({
  agents,
  loading = false,
  error,
  onRefresh,
  onAgentClick,
}: AgentsPanelProps) {
  const getStatusColor = (status: AgentStatus) => {
    switch (status) {
      case AgentStatus.IDLE:
        return 'bg-gray-400'
      case AgentStatus.RUNNING:
        return 'bg-green-500'
      case AgentStatus.PAUSED:
        return 'bg-yellow-500'
      case AgentStatus.ERROR:
        return 'bg-red-500'
      case AgentStatus.COMPLETED:
        return 'bg-blue-500'
      default:
        return 'bg-gray-400'
    }
  }

  const formatLastActive = (timestamp?: number) => {
    if (!timestamp) return 'Never'
    const diff = Date.now() - timestamp
    const minutes = Math.floor(diff / 60000)
    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    return new Date(timestamp).toLocaleDateString()
  }

  return (
    <Panel
      title="Agents"
      description="Active agent instances and capabilities"
      loading={loading}
      error={error}
      onRefresh={onRefresh}
    >
      <div className="space-y-4">
        {agents.length === 0 ? (
          <div className="py-8 text-center text-gray-500">No agents available</div>
        ) : (
          <div className="grid gap-4">
            {agents.map(agent => {
              const display = agentToDisplay(agent)
              return (
                <div
                  key={display.id}
                  className="cursor-pointer rounded-lg border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md"
                  onClick={() => onAgentClick?.(agent)}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-medium text-gray-900">{display.name}</h3>
                        <span
                          className={`inline-block h-2 w-2 rounded-full ${getStatusColor(
                            display.status
                          )}`}
                        />
                      </div>
                      <p className="mt-1 text-sm text-gray-500">Type: {display.type}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        Last active: {formatLastActive(display.lastActive)}
                      </p>
                    </div>
                  </div>
                  {display.capabilities.length > 0 && (
                    <div className="mt-3">
                      <div className="flex flex-wrap gap-2">
                        {display.capabilities.map(capability => (
                          <span
                            key={capability.name}
                            className="inline-flex items-center rounded-md bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800"
                            title={capability.description}
                          >
                            {capability.name} v{capability.version}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </Panel>
  )
}
