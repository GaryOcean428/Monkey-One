import React from 'react'
import { Card } from '../ui/Card'

interface Agent {
  id: string
  name: string
  status: 'online' | 'offline' | 'busy'
  lastActive: string
}

interface AgentStatusProps {
  agents: Agent[]
}

export const AgentStatus: React.FC<AgentStatusProps> = ({ agents }) => {
  const getStatusColor = (status: Agent['status']) => {
    switch (status) {
      case 'online':
        return 'bg-green-500'
      case 'offline':
        return 'bg-gray-500'
      case 'busy':
        return 'bg-yellow-500'
      default:
        return 'bg-gray-500'
    }
  }

  return (
    <div className="space-y-4">
      {agents.map(agent => (
        <Card key={agent.id} className="p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${getStatusColor(agent.status)}`} />
            <div>
              <h3 className="font-medium">{agent.name}</h3>
              <p className="text-sm text-gray-500">
                Last active: {new Date(agent.lastActive).toLocaleString()}
              </p>
            </div>
          </div>
          <span className="text-sm capitalize">{agent.status}</span>
        </Card>
      ))}
    </div>
  )
}
