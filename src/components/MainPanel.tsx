import React from 'react'
import { Tabs, TabsContent } from './ui/tabs'
import { ChatPanel } from './panels/ChatPanel'
import { MemoryPanel } from './panels/MemoryPanel'
import { AgentDashboard } from './panels/AgentDashboard'
import { WorkflowPanel } from './panels/WorkflowPanel'
import { DocumentsPanel } from './panels/DocumentsPanel'
import { DashboardPanel } from './panels/DashboardPanel'
import { ToolsPanel } from './panels/ToolsPanel'
import { SearchPanel } from './panels/SearchPanel'
import { VectorStorePanel } from './panels/VectorStorePanel'
import { GitHubPanel } from './panels/GitHubPanel'
import { PerformancePanel } from './panels/PerformancePanel'
import { useNavigationStore } from '../store/navigationStore'

export function MainPanel() {
  const { activeTab } = useNavigationStore()

  return (
    <div className="flex-1 overflow-hidden">
      <Tabs value={activeTab} className="h-full">
        <TabsContent value="chat" className="m-0 h-full">
          <ChatPanel />
        </TabsContent>
        <TabsContent value="agents" className="m-0 h-full">
          <AgentDashboard />
        </TabsContent>
        <TabsContent value="workflows" className="m-0 h-full">
          <WorkflowPanel />
        </TabsContent>
        <TabsContent value="memory" className="m-0 h-full">
          <MemoryPanel />
        </TabsContent>
        <TabsContent value="documents" className="m-0 h-full">
          <DocumentsPanel />
        </TabsContent>
        <TabsContent value="dashboard" className="m-0 h-full">
          <DashboardPanel />
        </TabsContent>
        <TabsContent value="tools" className="m-0 h-full">
          <ToolsPanel />
        </TabsContent>
        <TabsContent value="search" className="m-0 h-full">
          <SearchPanel />
        </TabsContent>
        <TabsContent value="vectorstore" className="m-0 h-full">
          <VectorStorePanel />
        </TabsContent>
        <TabsContent value="github" className="m-0 h-full">
          <GitHubPanel />
        </TabsContent>
        <TabsContent value="performance" className="m-0 h-full">
          <PerformancePanel />
        </TabsContent>
      </Tabs>
    </div>
  )
}
