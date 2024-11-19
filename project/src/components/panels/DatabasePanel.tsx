import React from 'react';
import { Database, Table, Play } from 'lucide-react';
import { Button } from '../ui/button';

export function DatabasePanel() {
  return (
    <div className="h-full flex flex-col p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold dark:text-white">Database</h2>
        <Button variant="outline">
          <Play className="w-4 h-4 mr-2" />
          Run Query
        </Button>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Table className="text-blue-500" size={20} />
            <h3 className="font-medium dark:text-white">Tables</h3>
          </div>
          
          {/* Add table list */}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Database className="text-green-500" size={20} />
            <h3 className="font-medium dark:text-white">Query Editor</h3>
          </div>
          
          {/* Add SQL editor */}
        </div>
      </div>
    </div>
  );
}