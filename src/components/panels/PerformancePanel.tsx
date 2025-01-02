import React from 'react';
import { Card } from '../ui/card';
import { LoadingSpinner } from '../ui/loading-spinner';
import { ToolhouseErrorBoundary } from '../ErrorBoundary/ToolhouseErrorBoundary';
import { Clock, CircuitBoard, Cpu, Activity } from 'lucide-react';

export function PerformancePanel() {
  const [isLoading, setIsLoading] = React.useState(false);

  return (
    <div className="h-full p-4 bg-background">
      <h2 className="text-lg font-semibold mb-4">Performance Metrics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-blue-500" />
            <h3 className="text-sm font-medium">Response Time</h3>
          </div>
          <p className="text-2xl font-bold">124ms</p>
          <p className="text-sm text-muted-foreground">Average over last hour</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <CircuitBoard className="w-4 h-4 text-green-500" />
            <h3 className="text-sm font-medium">Memory Usage</h3>
          </div>
          <p className="text-2xl font-bold">512MB</p>
          <p className="text-sm text-muted-foreground">Current allocation</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Cpu className="w-4 h-4 text-purple-500" />
            <h3 className="text-sm font-medium">CPU Usage</h3>
          </div>
          <p className="text-2xl font-bold">45%</p>
          <p className="text-sm text-muted-foreground">Average load</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-red-500" />
            <h3 className="text-sm font-medium">Active Connections</h3>
          </div>
          <p className="text-2xl font-bold">23</p>
          <p className="text-sm text-muted-foreground">Current sessions</p>
        </Card>
      </div>

      {isLoading && (
        <div className="fixed inset-0 bg-background/80 flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      )}
    </div>
  );
}