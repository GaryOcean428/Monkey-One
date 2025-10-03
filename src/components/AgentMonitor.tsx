import React, { useState } from 'react'
import { Card as BaseCard } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import {
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  Power,
  Filter,
  SortAsc,
  SortDesc,
} from 'lucide-react'
import type { Agent } from '../types'

interface AgentMonitorProps {
  agents: Agent[]
  activeAgent: Agent | null
  onAgentSelect?: (agent: Agent) => void
}

interface AgentCardProps {
  agent: Agent
  isActive: boolean
  onClick?: () => void
}

const AgentCard: React.FC<AgentCardProps> = ({ agent, isActive, onClick }) => {
  const statusColors = {
    available: 'bg-green-500',
    busy: 'bg-yellow-500',
    offline: 'bg-gray-500',
    error: 'bg-red-500',
  }

  const statusIcons = {
    available: CheckCircle,
    busy: Clock,
    offline: Power,
    error: AlertCircle,
  }

  const StatusIcon = statusIcons[agent.status]

  return (
    <BaseCard
      className={`cursor-pointer p-4 transition-all ${isActive ? 'ring-primary ring-2' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-medium">{agent.name}</h3>
          <p className="text-muted-foreground mt-1 text-sm">{agent.description}</p>
        </div>
        <StatusIcon
          className={`h-5 w-5 ${
            agent.status === 'available'
              ? 'text-green-500'
              : agent.status === 'busy'
                ? 'text-yellow-500'
                : agent.status === 'error'
                  ? 'text-red-500'
                  : 'text-gray-500'
          }`}
        />
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Model</span>
          <span>{agent.model}</span>
        </div>
        {agent.performance && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Success Rate</span>
            <span>{(agent.performance.successRate * 100).toFixed(1)}%</span>
          </div>
        )}
        {agent.lastActive && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Last Active</span>
            <span>{new Date(agent.lastActive).toLocaleString()}</span>
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {agent.capabilities.map(capability => (
          <Badge key={capability} variant="secondary">
            {capability}
          </Badge>
        ))}
      </div>

      {agent.error && (
        <div className="mt-4 rounded bg-red-50 p-2 text-sm text-red-600 dark:bg-red-900/10 dark:text-red-400">
          {agent.error}
        </div>
      )}
    </BaseCard>
  )
}

export function AgentMonitor({ agents, activeAgent, onAgentSelect }: AgentMonitorProps) {
  const [filterStatus, setFilterStatus] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  const filteredAgents = filterStatus
    ? agents.filter(agent => agent.status === filterStatus)
    : agents

  const sortedAgents = filteredAgents.sort((a, b) => {
    if (sortOrder === 'asc') {
      return a.name.localeCompare(b.name)
    } else {
      return b.name.localeCompare(a.name)
    }
  })

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold">Agent Monitor</h2>
          <p className="text-muted-foreground mt-1">Monitor and manage your AI agents</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Activity className="mr-2 h-4 w-4" />
            Refresh Status
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilterStatus(filterStatus ? null : 'available')}
          >
            <Filter className="mr-2 h-4 w-4" />
            {filterStatus ? 'Clear Filter' : 'Filter by Status'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          >
            {sortOrder === 'asc' ? (
              <SortAsc className="mr-2 h-4 w-4" />
            ) : (
              <SortDesc className="mr-2 h-4 w-4" />
            )}
            Sort by Name
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sortedAgents?.map(agent => (
          <AgentCard
            key={agent.id}
            agent={agent}
            isActive={agent.id === activeAgent?.id}
            onClick={() => onAgentSelect?.(agent)}
          />
        ))}
      </div>
    </div>
  )
}
