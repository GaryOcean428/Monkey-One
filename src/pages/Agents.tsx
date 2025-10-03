import React from 'react'
import { AgentsPanel } from '@/components/agents/AgentsPanel'
import { Card } from '@/components/ui/card'
import { PageHeader } from '@/components/ui/page-header'

export function Agents() {
  return (
    <div className="flex h-full flex-col space-y-4">
      <PageHeader title="Agents" description="Manage and monitor your AI agents" />

      <Card className="flex-1 overflow-hidden p-6">
        <AgentsPanel />
      </Card>
    </div>
  )
}
