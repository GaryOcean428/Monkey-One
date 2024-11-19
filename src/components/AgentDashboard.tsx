import React from 'react';
import { AgentMonitor } from './AgentMonitor';
import { AgentWorkflow } from './AgentWorkflow';
import { PerformanceMetrics } from './PerformanceMetrics';
import { ObserverPanel } from './ObserverPanel';
import { useAgents } from '../context/AgentContext';

export function AgentDashboard() {
  const { agents, activeAgent } = useAgents();

  return (
    <div className="grid grid-cols-12 gap-4 p-4 h-full">
      <div className="col-span-8 space-y-4">
        <AgentMonitor agents={agents} activeAgent={activeAgent} />
        <AgentWorkflow />
      </div>
      <div className="col-span-4 space-y-4">
        <PerformanceMetrics />
        <ObserverPanel />
      </div>
    </div>
  );
}