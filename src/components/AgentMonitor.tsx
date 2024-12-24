import React from 'react';
import { BasePanel } from './panels/BasePanel';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Activity, AlertCircle, CheckCircle, Clock, Power } from 'lucide-react';
import type { Agent } from '../types';

interface AgentMonitorProps {
  agents: Agent[];
  activeAgent: Agent | null;
  onAgentSelect?: (agent: Agent) => void;
}

const statusColors = {
  available: 'bg-green-500',
  busy: 'bg-yellow-500',
  offline: 'bg-gray-500',
  error: 'bg-red-500'
};

const statusIcons = {
  available: CheckCircle,
  busy: Clock,
  offline: Power,
  error: AlertCircle
};

export function AgentMonitor({ agents, activeAgent, onAgentSelect }: AgentMonitorProps) {
  return (
    <BasePanel
      title="Agent Monitor"
      description="Monitor and manage your AI agents"
      headerActions={
        <Button variant="outline" size="sm">
          <Activity className="w-4 h-4 mr-2" />
          Refresh Status
        </Button>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agents.map((agent) => {
          const StatusIcon = statusIcons[agent.status];
          return (
            <Card
              key={agent.id}
              className={`p-4 cursor-pointer transition-all ${
                activeAgent?.id === agent.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => onAgentSelect?.(agent)}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium">{agent.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {agent.description}
                  </p>
                </div>
                <StatusIcon className={`w-5 h-5 ${
                  agent.status === 'available' ? 'text-green-500' :
                  agent.status === 'busy' ? 'text-yellow-500' :
                  agent.status === 'error' ? 'text-red-500' :
                  'text-gray-500'
                }`} />
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
                {agent.capabilities.map((capability) => (
                  <Badge key={capability} variant="secondary">
                    {capability}
                  </Badge>
                ))}
              </div>

              {agent.error && (
                <div className="mt-4 p-2 bg-red-50 dark:bg-red-900/10 rounded text-sm text-red-600 dark:text-red-400">
                  {agent.error}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </BasePanel>
  );
}