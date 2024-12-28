import React from 'react';
import { BasePanel } from './BasePanel';
import { AgentDashboard } from './AgentDashboard';
import { AgentMonitor } from './AgentMonitor';

export default function AgentsPanel() {
  return (
    <BasePanel title="Agents">
      <div className="flex flex-col gap-4 p-4">
        <AgentDashboard />
        <AgentMonitor />
      </div>
    </BasePanel>
  );
}
