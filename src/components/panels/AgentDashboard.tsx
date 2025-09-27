import { AgentMonitor } from '../AgentMonitor'
import { AgentWorkflow } from '../AgentWorkflow'
import { PerformanceMetrics } from '../PerformanceMetrics'
import { ObserverPanel } from '../ObserverPanel'
import { useAgents } from '../../hooks/useAgents'

export default function AgentDashboard() {
  const { agents, activeAgent } = useAgents()

  return (
    <div className="grid h-full grid-cols-12 gap-4 p-4">
      <div className="col-span-8 space-y-4">
        <AgentMonitor agents={agents as any} activeAgent={activeAgent as any} />
        <AgentWorkflow />
      </div>
      <div className="col-span-4 space-y-4">
        <PerformanceMetrics />
        <ObserverPanel />
      </div>
    </div>
  )
}
