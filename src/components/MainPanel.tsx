import React from 'react';
import { Tabs, TabsContent } from './ui/tabs';
import ChatPanel from './panels/ChatPanel';
import MemoryPanel from './panels/MemoryPanel';
import AgentDashboard from './panels/AgentDashboard';
import { WorkflowPanel } from './panels/WorkflowPanel';
import { DocumentsPanel } from './panels/DocumentsPanel';
import { DashboardPanel } from './panels/DashboardPanel';
import { ToolsPanel } from './panels/ToolsPanel';
import { SearchPanel } from './panels/SearchPanel';
import { VectorStorePanel } from './panels/VectorStorePanel';
import { GitHubPanel } from './panels/GitHubPanel';
import { PerformancePanel } from './panels/PerformancePanel';
import { useNavigationStore } from '../store/navigationStore';

export function MainPanel() {
  const { activeTab } = useNavigationStore();

  return (
    <div className="flex-1 overflow-hidden">
      <Tabs value={activeTab} className="h-full">
        <TabsContent value="chat" className="h-full m-0">
          <ChatPanel />
        </TabsContent>
        <TabsContent value="agents" className="h-full m-0">
          <AgentDashboard />
        </TabsContent>
        <TabsContent value="workflows" className="h-full m-0">
          <WorkflowPanel />
        </TabsContent>
        <TabsContent value="memory" className="h-full m-0">
          <MemoryPanel />
        </TabsContent>
        <TabsContent value="documents" className="h-full m-0">
          <DocumentsPanel />
        </TabsContent>
        <TabsContent value="dashboard" className="h-full m-0">
          <DashboardPanel />
        </TabsContent>
        <TabsContent value="tools" className="h-full m-0">
          <ToolsPanel />
        </TabsContent>
        <TabsContent value="search" className="h-full m-0">
          <SearchPanel />
        </TabsContent>
        <TabsContent value="vectorstore" className="h-full m-0">
          <VectorStorePanel />
        </TabsContent>
        <TabsContent value="github" className="h-full m-0">
          <GitHubPanel />
        </TabsContent>
        <TabsContent value="performance" className="h-full m-0">
          <PerformancePanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}