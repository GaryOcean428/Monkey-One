import React from 'react'
import { Database, Table, Play } from 'lucide-react'
import { Button } from '../ui/button'

export function DatabasePanel() {
  return (
    <div className="flex h-full flex-col p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold dark:text-white">Database</h2>
        <Button variant="outline">
          <Play className="mr-2 h-4 w-4" />
          Run Query
        </Button>
      </div>

      <div className="grid flex-1 grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
          <div className="mb-4 flex items-center gap-2">
            <Table className="text-blue-500" size={20} />
            <h3 className="font-medium dark:text-white">Tables</h3>
          </div>

          {/* Add table list */}
        </div>

        <div className="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
          <div className="mb-4 flex items-center gap-2">
            <Database className="text-green-500" size={20} />
            <h3 className="font-medium dark:text-white">Query Editor</h3>
          </div>

          {/* Add SQL editor */}
        </div>
      </div>
    </div>
  )
}
