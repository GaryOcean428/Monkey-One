import React from 'react';
import { AgentMonitor } from './AgentMonitor';
import { AgentWorkflow } from './AgentWorkflow';
import { PerformanceMetrics } from './PerformanceMetrics';
import { ObserverPanel } from './ObserverPanel';
import { useAgents } from '../contexts/AgentContext';

/**
 * AgentDashboard Component
 * 
 * Main dashboard interface for monitoring and managing agents.
 * Displays agent status, workflows, performance metrics, and observer panel.
 */
export function AgentDashboard() {
  const { agents, activeAgent } = useAgents();

  return (
    <div className="grid grid-cols-12 gap-4 p-4 h-full" role="main">
      <h1 className="col-span-12 text-2xl font-bold mb-4">Agent Dashboard</h1>
      
      <div className="col-span-8 space-y-4" role="region" aria-label="Agent Status and Workflow">
        <AgentMonitor agents={agents} activeAgent={activeAgent} />
        <AgentWorkflow />
      </div>

      <div className="col-span-4 space-y-4" role="complementary" aria-label="Performance and Monitoring">
        <section aria-labelledby="performance-heading">
          <h2 id="performance-heading" className="text-2xl font-bold">Performance Metrics</h2>
          <div className="mt-4">
            <PerformanceMetrics />
          </div>
        </section>

        <section aria-labelledby="observer-heading">
          <h2 id="observer-heading" className="text-2xl font-bold">Code Observer</h2>
          <div className="mt-4">
            <ObserverPanel />
          </div>
        </section>
      </div>
    </div>
  );
}