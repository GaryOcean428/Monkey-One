import React from 'react'
import { Button } from '../components/ui/button'

export const DocumentsPanel: React.FC = () => {
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Documents</h1>
        <Button>Upload Document</Button>
      </div>

      <div className="grid gap-4">
        <div className="border rounded-lg p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold">No documents yet</h3>
              <p className="text-sm text-gray-500">
                Upload your first document to get started
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
