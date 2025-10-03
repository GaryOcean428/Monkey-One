import React from 'react'
import { Card } from '../ui/card'

export default function GithubPanel() {
  return (
    <div className="bg-background h-full p-4">
      <h2 className="mb-4 text-lg font-semibold">GitHub Integration</h2>
      <div className="grid grid-cols-1 gap-4">
        <Card className="p-4">
          <h3 className="mb-2 text-sm font-medium">Repository Status</h3>
          <p className="text-muted-foreground text-sm">
            Configure your GitHub integration settings here.
          </p>
        </Card>
      </div>
    </div>
  )
}
