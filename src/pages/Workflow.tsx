import React from 'react'
import { WorkflowPanel } from '@/components/workflow/WorkflowPanel'
import { Card } from '@/components/ui/card'
import { PageHeader } from '@/components/ui/page-header'

export function Workflow() {
  return (
    <div className="flex h-full flex-col space-y-4">
      <PageHeader title="Workflow" description="Design and manage your AI workflows" />

      <Card className="flex-1 overflow-hidden p-6">
        <WorkflowPanel />
      </Card>
    </div>
  )
}
