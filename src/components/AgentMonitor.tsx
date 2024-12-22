import React from 'react';
import { Activity, Brain, CheckCircle, XCircle } from 'lucide-react';
import type { Agent } from '../types';

interface AgentMonitorProps {
  agents: Agent[];
  activeAgent: Agent | null;
}

export function AgentMonitor({ agents, activeAgent }: AgentMonitorProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
      <h2 className="text-lg font-semibold mb-4 dark:text-white">Agent Monitor</h2>
      <div className="space-y-4">
        {agents.map(agent => (
          <div
            key={agent.id}
            className={`flex items-center justify-between p-3 rounded-lg border
              ${activeAgent?.id === agent.id ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700'}
            `}
          >
            <div className="flex items-center gap-3">
              <Brain className="text-gray-500 dark:text-gray-400" size={20} />
              <div>
                <h3 className="font-medium dark:text-white">{agent.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {agent.type.charAt(0).toUpperCase() + agent.type.slice(1)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {agent.status === 'active' && (
                <Activity className="text-green-500 animate-pulse" size={20} />
              )}
              {agent.status === 'idle' && (
                <CheckCircle className="text-gray-400" size={20} />
              )}
              {agent.status === 'error' && (
                <XCircle className="text-red-500" size={20} />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}