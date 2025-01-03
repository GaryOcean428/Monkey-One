import React from 'react'
import { Card } from '../ui/card'

export interface BasePanelProps {
  title: string
  description?: string
  children: React.ReactNode
  actions?: React.ReactNode
}

export function BasePanel({ title, description, children, actions }: BasePanelProps) {
  return (
    <Card className="p-6">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold">{title}</h2>
          {description && <p className="mt-1 text-muted-foreground">{description}</p>}
        </div>
        {actions && <div className="ml-4">{actions}</div>}
      </div>
      {children}
    </Card>
  )
}
