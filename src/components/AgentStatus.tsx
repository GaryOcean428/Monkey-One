import React from 'react';
import type { Agent } from '../types';

interface AgentStatusProps {
  agents: Agent[];
}

export function AgentStatus({ agents }: AgentStatusProps) {
  return (
    <div className="fixed top-0 right-0 p-4 space-y-2">
      {agents.map(agent => (
        <div
          key={agent.id}
          className={`flex items-center gap-2 p-2 rounded-lg ${
            agent.status === 'active'
              ? 'bg-green-100 text-green-800'
              : agent.status === 'error'
              ? 'bg-red-100 text-red-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          <div className={`w-2 h-2 rounded-full ${
            agent.status === 'active'
              ? 'bg-green-500'
              : agent.status === 'error'
              ? 'bg-red-500'
              : 'bg-gray-500'
          }`} />
          <span className="text-sm font-medium">{agent.name}</span>
        </div>
      ))}
    </div>
  );
}