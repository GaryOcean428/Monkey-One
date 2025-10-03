import React from 'react'
import { Button } from '../components/ui/button'

export const GithubPanel: React.FC = () => {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">GitHub Integration</h1>
        <Button>Connect GitHub</Button>
      </div>

      <div className="space-y-6">
        <div className="rounded-lg border p-6">
          <h2 className="mb-4 text-xl font-semibold">Repository Access</h2>
          <p className="text-gray-600">
            Connect your GitHub account to access and manage your repositories.
          </p>
        </div>

        <div className="rounded-lg border p-6">
          <h2 className="mb-4 text-xl font-semibold">Recent Activity</h2>
          <p className="text-gray-600">
            No recent activity. Connect your GitHub account to see your repository activities.
          </p>
        </div>
      </div>
    </div>
  )
}
