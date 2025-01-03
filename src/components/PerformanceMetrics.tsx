import React, { useState } from 'react'
import { BasePanel } from './panels/BasePanel'
import { Card } from './ui/card'
import { Button } from './ui/button'
import { Select } from './ui/select'
import { Activity, Clock, Target, Download } from 'lucide-react'
import { useAgents } from '../hooks/useAgents'
import { ProgressBar } from './ui/progress-bar'

type TimeRange = '1h' | '24h' | '7d' | '30d' | 'all'

interface AgentPerformance {
  successRate: number
  averageResponseTime: number
  totalTasks: number
}

interface AgentWithPerformance {
  performance: AgentPerformance
}

export function PerformanceMetrics() {
  const { metrics, activeAgent } = useAgents()
  const [timeRange, setTimeRange] = useState<TimeRange>('24h')

  const stats = [
    {
      label: 'Success Rate',
      value: `${(metrics.successRate * 100).toFixed(1)}%`,
      icon: Target,
      color: 'text-green-500',
      description: 'Percentage of successfully completed tasks',
    },
    {
      label: 'Response Time',
      value: `${metrics.averageResponseTime.toFixed(2)}ms`,
      icon: Clock,
      color: 'text-blue-500',
      description: 'Average time to complete tasks',
    },
    {
      label: 'Tasks Completed',
      value: metrics.messagesProcessed.toString(),
      icon: Activity,
      color: 'text-purple-500',
      description: 'Total number of processed tasks',
    },
  ]

  const handleExport = () => {
    const data = {
      timeRange,
      metrics: {
        successRate: metrics.successRate,
        averageResponseTime: metrics.averageResponseTime,
        messagesProcessed: metrics.messagesProcessed,
      },
      activeAgent:
        activeAgent && 'performance' in activeAgent
          ? {
              performance: (activeAgent as unknown as AgentWithPerformance).performance,
            }
          : null,
      exportedAt: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `performance-metrics-${timeRange}-${new Date().toISOString()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const hasPerformanceData = activeAgent && 'performance' in activeAgent
  const agentPerformance = hasPerformanceData
    ? (activeAgent as unknown as AgentWithPerformance).performance
    : null

  return (
    <BasePanel
      title="Performance Metrics"
      description="Real-time agent performance monitoring"
      actions={
        <div className="flex items-center gap-2">
          <Select
            value={timeRange}
            onChange={e => setTimeRange(e.target.value as TimeRange)}
            className="w-32"
            aria-label="Select time range"
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="all">All Time</option>
          </Select>
          <Button variant="outline" size="sm" onClick={handleExport} aria-label="Export metrics">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      }
    >
      <div className="grid gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index} className="p-4" role="region" aria-label={stat.label}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`rounded-lg bg-gray-100 p-2 dark:bg-gray-800 ${stat.color}`}
                    aria-hidden="true"
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                    <h4 className="text-2xl font-semibold">{stat.value}</h4>
                    <p className="mt-1 text-sm text-muted-foreground">{stat.description}</p>
                  </div>
                </div>
              </div>
            </Card>
          )
        })}

        {agentPerformance && (
          <Card className="p-4" role="region" aria-label="Active Agent Performance">
            <h3 className="mb-4 font-medium">Active Agent Performance</h3>
            <div className="space-y-4">
              <div>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-muted-foreground">Success Rate</span>
                  <span>{(agentPerformance.successRate * 100).toFixed(1)}%</span>
                </div>
                <ProgressBar value={agentPerformance.successRate} max={1} color="green" />
              </div>

              <div>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-muted-foreground">Response Time</span>
                  <span>{agentPerformance.averageResponseTime.toFixed(2)}ms</span>
                </div>
                <ProgressBar value={agentPerformance.averageResponseTime} max={1000} color="blue" />
              </div>

              <div>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Tasks</span>
                  <span>{agentPerformance.totalTasks}</span>
                </div>
                <ProgressBar value={agentPerformance.totalTasks} max={100} color="purple" />
              </div>
            </div>
          </Card>
        )}
      </div>
    </BasePanel>
  )
}
