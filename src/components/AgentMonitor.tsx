import React, { useState } from 'react';
import { Card as BaseCard } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Activity, AlertCircle, CheckCircle, Clock, Power, Filter, SortAsc, SortDesc } from 'lucide-react';
import type { Agent } from '../types';

interface AgentMonitorProps {
  agents: Agent[];
  activeAgent: Agent | null;
  onAgentSelect?: (agent: Agent) => void;
}

interface AgentCardProps {
  agent: Agent;
  isActive: boolean;
  onClick?: () => void;
}

const AgentCard: React.FC<AgentCardProps> = ({ agent, isActive, onClick }) => {
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

  const StatusIcon = statusIcons[agent.status];

  return (
    <BaseCard
      className={`p-4 cursor-pointer transition-all ${
        isActive ? 'ring-2 ring-primary' : ''
      }`}
      onClick={onClick}
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
    </BaseCard>
  );
};

export function AgentMonitor({ agents, activeAgent, onAgentSelect }: AgentMonitorProps) {
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const filteredAgents = filterStatus
    ? agents.filter(agent => agent.status === filterStatus)
    : agents;

  const sortedAgents = filteredAgents.sort((a, b) => {
    if (sortOrder === 'asc') {
      return a.name.localeCompare(b.name);
    } else {
      return b.name.localeCompare(a.name);
    }
  });

  return (
    <div className="h-full p-6 overflow-y-auto">
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold">Agent Monitor</h2>
          <p className="text-muted-foreground mt-1">Monitor and manage your AI agents</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Activity className="w-4 h-4 mr-2" />
            Refresh Status
          </Button>
          <Button variant="outline" size="sm" onClick={() => setFilterStatus(filterStatus ? null : 'available')}>
            <Filter className="w-4 h-4 mr-2" />
            {filterStatus ? 'Clear Filter' : 'Filter by Status'}
          </Button>
          <Button variant="outline" size="sm" onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}>
            {sortOrder === 'asc' ? <SortAsc className="w-4 h-4 mr-2" /> : <SortDesc className="w-4 h-4 mr-2" />}
            Sort by Name
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedAgents?.map((agent) => (
          <AgentCard
            key={agent.id}
            agent={agent}
            isActive={agent.id === activeAgent?.id}
            onClick={() => onAgentSelect?.(agent)}
          />
        ))}
      </div>
    </div>
  );
}
