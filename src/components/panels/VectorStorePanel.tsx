import React from 'react';
import { Database, Search, Plus } from 'lucide-react';
import { Button } from '../ui/button';

export function VectorStorePanel() {
  return (
    <div className="h-full flex flex-col p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold dark:text-white">Vector Store</h2>
        <Button variant="outline">
          <Plus className="w-4 h-4 mr-2" />
          Create Index
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm mb-4">
          <div className="flex items-center gap-2 mb-4">
            <Database className="text-blue-500" size={20} />
            <h3 className="font-medium dark:text-white">Pinecone Indexes</h3>
          </div>
          
          {/* Add index list and management UI */}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Search className="text-green-500" size={20} />
            <h3 className="font-medium dark:text-white">Vector Search</h3>
          </div>
          
          {/* Add vector search interface */}
        </div>
      </div>
    </div>
  );
}