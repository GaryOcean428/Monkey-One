import React from 'react'
import type { Agent } from '../types'

interface AgentStatusProps {
  agents: Agent[]
}

export function AgentStatus({ agents }: AgentStatusProps) {
  return (
    <div className="fixed top-0 right-0 space-y-2 p-4">
      {agents.map(agent => (
        <div
          key={agent.id}
          className={`flex items-center gap-2 rounded-lg p-2 ${
            agent.status === 'active'
              ? 'bg-green-100 text-green-800'
              : agent.status === 'error'
                ? 'bg-red-100 text-red-800'
                : 'bg-gray-100 text-gray-800'
          }`}
        >
          <div
            className={`h-2 w-2 rounded-full ${
              agent.status === 'active'
                ? 'bg-green-500'
                : agent.status === 'error'
                  ? 'bg-red-500'
                  : 'bg-gray-500'
            }`}
          />
          <span className="text-sm font-medium">{agent.name}</span>
        </div>
      ))}
    </div>
  )
}
