import React from 'react'
import { Button } from '../components/ui/button'

export const GithubPanel: React.FC = () => {
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">GitHub Integration</h1>
        <Button>Connect GitHub</Button>
      </div>

      <div className="space-y-6">
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Repository Access</h2>
          <p className="text-gray-600">
            Connect your GitHub account to access and manage your repositories.
          </p>
        </div>

        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <p className="text-gray-600">
            No recent activity. Connect your GitHub account to see your repository activities.
          </p>
        </div>
      </div>
    </div>
  )
}
