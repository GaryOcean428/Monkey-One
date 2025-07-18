import React, { useState } from 'react'
import { AgentMonitor } from './AgentMonitor'
import { AgentWorkflow } from './AgentWorkflow'
import { PerformanceMetrics } from './PerformanceMetrics'
import { ObserverPanel } from './ObserverPanel'
import { useAgents } from '../contexts/AgentContext'
import { Button } from './ui/button'

/**
 * AgentDashboard Component
 *
 * Main dashboard interface for monitoring and managing agents.
 * Displays agent status, workflows, performance metrics, and observer panel.
 */
export function AgentDashboard() {
  const { agents, activeAgent } = useAgents()
  const [showAgentMonitor, setShowAgentMonitor] = useState(true)
  const [showAgentWorkflow, setShowAgentWorkflow] = useState(true)
  const [showPerformanceMetrics, setShowPerformanceMetrics] = useState(true)
  const [showObserverPanel, setShowObserverPanel] = useState(true)

  return (
    <div className="grid h-full grid-cols-12 gap-4 p-4" role="main">
      <h1 className="col-span-12 mb-4 text-2xl font-bold">Agent Dashboard</h1>

      <div className="col-span-12 mb-4 flex justify-between">
        <Button onClick={() => setShowAgentMonitor(!showAgentMonitor)}>
          {showAgentMonitor ? 'Hide' : 'Show'} Agent Monitor
        </Button>
        <Button onClick={() => setShowAgentWorkflow(!showAgentWorkflow)}>
          {showAgentWorkflow ? 'Hide' : 'Show'} Agent Workflow
        </Button>
        <Button onClick={() => setShowPerformanceMetrics(!showPerformanceMetrics)}>
          {showPerformanceMetrics ? 'Hide' : 'Show'} Performance Metrics
        </Button>
        <Button onClick={() => setShowObserverPanel(!showObserverPanel)}>
          {showObserverPanel ? 'Hide' : 'Show'} Observer Panel
        </Button>
      </div>

      <div className="col-span-8 space-y-4" role="region" aria-label="Agent Status and Workflow">
        {showAgentMonitor && <AgentMonitor agents={agents} activeAgent={activeAgent} />}
        {showAgentWorkflow && <AgentWorkflow />}
      </div>

      <div
        className="col-span-4 space-y-4"
        role="complementary"
        aria-label="Performance and Monitoring"
      >
        {showPerformanceMetrics && (
          <section aria-labelledby="performance-heading">
            <h2 id="performance-heading" className="text-2xl font-bold">
              Performance Metrics
            </h2>
            <div className="mt-4">
              <PerformanceMetrics />
            </div>
          </section>
        )}

        {showObserverPanel && (
          <section aria-labelledby="observer-heading">
            <h2 id="observer-heading" className="text-2xl font-bold">
              Code Observer
            </h2>
            <div className="mt-4">
              <ObserverPanel />
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
interface Props {
  children: ReactNode
}
interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div
          className="rounded border border-red-500 bg-red-50 p-4 text-red-900"
          role="alert"
          aria-live="polite"
        >
          <h2 className="mb-2 text-lg font-semibold">Something went wrong</h2>
          <p className="text-sm">{this.state.error?.message}</p>
        </div>
      )
    }

    return this.props.children
  }
}
