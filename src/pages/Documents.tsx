import React from 'react'
import { Button } from '../components/ui/button'

export const DocumentsPanel: React.FC = () => {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Documents</h1>
        <Button>Upload Document</Button>
      </div>

      <div className="grid gap-4">
        <div className="rounded-lg border p-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold">No documents yet</h3>
              <p className="text-sm text-gray-500">Upload your first document to get started</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
