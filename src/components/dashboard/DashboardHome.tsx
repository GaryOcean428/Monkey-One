import React from 'react'
import { Card } from '../ui/Card'
import { useMetrics } from '../../hooks/useMetrics'
import { useAgents } from '../../hooks/useAgents'
import { MetricsChart } from './MetricsChart'
import { AgentStatus } from './AgentStatus'

export interface DashboardHomeProps {
  className?: string
}

const DashboardHome: React.FC<DashboardHomeProps> = ({ className = '' }) => {
  const { metrics, isLoading: metricsLoading } = useMetrics()
  const { agents, isLoading: agentsLoading } = useAgents()

  return (
    <div className={`space-y-6 p-6 ${className}`}>
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="p-4">
          <h2 className="mb-2 text-lg font-semibold">System Health</h2>
          {metricsLoading ? <div>Loading...</div> : <MetricsChart data={metrics} />}
        </Card>

        <Card className="p-4">
          <h2 className="mb-2 text-lg font-semibold">Active Agents</h2>
          {agentsLoading ? <div>Loading...</div> : <AgentStatus agents={agents} />}
        </Card>

        <Card className="p-4">
          <h2 className="mb-2 text-lg font-semibold">Recent Activity</h2>
          <div className="space-y-2">{/* Add recent activity list here */}</div>
        </Card>
      </div>
    </div>
  )
}

export default DashboardHome
