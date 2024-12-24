import React from 'react';
import { BasePanel } from './panels/BasePanel';
import { Card } from './ui/card';
import { Activity, Brain, Clock, Target } from 'lucide-react';
import { useAgents } from '../hooks/useAgents';

export function PerformanceMetrics() {
  const { metrics, activeAgent } = useAgents();

  const stats = [
    {
      label: 'Success Rate',
      value: `${(metrics.successRate * 100).toFixed(1)}%`,
      icon: Target,
      color: 'text-green-500'
    },
    {
      label: 'Response Time',
      value: `${metrics.averageResponseTime.toFixed(2)}ms`,
      icon: Clock,
      color: 'text-blue-500'
    },
    {
      label: 'Tasks Completed',
      value: metrics.messagesProcessed.toString(),
      icon: Activity,
      color: 'text-purple-500'
    }
  ];

  return (
    <BasePanel
      title="Performance Metrics"
      description="Real-time agent performance monitoring"
    >
      <div className="grid gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-gray-100 dark:bg-gray-800 ${stat.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.label}
                    </p>
                    <h4 className="text-2xl font-semibold">{stat.value}</h4>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}

        {activeAgent && activeAgent.performance && (
          <Card className="p-4">
            <h3 className="font-medium mb-4">Active Agent Performance</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Success Rate</span>
                  <span>{(activeAgent.performance.successRate * 100).toFixed(1)}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full dark:bg-gray-800">
                  <div
                    className="h-2 bg-green-500 rounded-full"
                    style={{ width: `${activeAgent.performance.successRate * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Response Time</span>
                  <span>{activeAgent.performance.averageResponseTime.toFixed(2)}ms</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full dark:bg-gray-800">
                  <div
                    className="h-2 bg-blue-500 rounded-full"
                    style={{ width: `${Math.min(activeAgent.performance.averageResponseTime / 1000, 1) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Total Tasks</span>
                  <span>{activeAgent.performance.totalTasks}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full dark:bg-gray-800">
                  <div
                    className="h-2 bg-purple-500 rounded-full"
                    style={{ width: `${Math.min(activeAgent.performance.totalTasks / 100, 1) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </BasePanel>
  );
}