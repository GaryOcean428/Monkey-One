import React from 'react'
import { ToolsPanel } from '@/components/tools/ToolsPanel'
import { Card } from '@/components/ui/card'
import { PageHeader } from '@/components/ui/page-header'

export function Tools() {
  return (
    <div className="flex h-full flex-col space-y-4">
      <PageHeader title="Tools" description="Configure and manage your AI tools and integrations" />

      <Card className="flex-1 overflow-hidden p-6">
        <ToolsPanel />
      </Card>
    </div>
  )
}
