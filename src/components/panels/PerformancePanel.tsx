import React from 'react'
import { Card } from '../ui/card'
import { LoadingSpinner } from '../ui/loading-spinner'
import { Clock, CircuitBoard, Cpu, Activity } from 'lucide-react'

export function PerformancePanel() {
  const [isLoading] = React.useState(false)

  return (
    <div className="bg-background h-full p-4">
      <h2 className="mb-4 text-lg font-semibold">Performance Metrics</h2>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card className="p-4">
          <div className="mb-2 flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-500" />
            <h3 className="text-sm font-medium">Response Time</h3>
          </div>
          <p className="text-2xl font-bold">124ms</p>
          <p className="text-muted-foreground text-sm">Average over last hour</p>
        </Card>

        <Card className="p-4">
          <div className="mb-2 flex items-center gap-2">
            <CircuitBoard className="h-4 w-4 text-green-500" />
            <h3 className="text-sm font-medium">Memory Usage</h3>
          </div>
          <p className="text-2xl font-bold">512MB</p>
          <p className="text-muted-foreground text-sm">Current allocation</p>
        </Card>

        <Card className="p-4">
          <div className="mb-2 flex items-center gap-2">
            <Cpu className="h-4 w-4 text-purple-500" />
            <h3 className="text-sm font-medium">CPU Usage</h3>
          </div>
          <p className="text-2xl font-bold">45%</p>
          <p className="text-muted-foreground text-sm">Average load</p>
        </Card>

        <Card className="p-4">
          <div className="mb-2 flex items-center gap-2">
            <Activity className="h-4 w-4 text-red-500" />
            <h3 className="text-sm font-medium">Active Connections</h3>
          </div>
          <p className="text-2xl font-bold">23</p>
          <p className="text-muted-foreground text-sm">Current sessions</p>
        </Card>
      </div>

      {isLoading && (
        <div className="bg-background/80 fixed inset-0 flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      )}
    </div>
  )
}
