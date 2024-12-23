import React, { useState } from 'react';
import { Wrench, Plus, Settings, Wand2 } from 'lucide-react';
import { Button } from '../ui/button';
import { ToolCreator } from '../tools/ToolCreator';
import { useTools } from '../../hooks/useTools';

export function ToolsPanel() {
  const { tools, executeTool } = useTools();
  const [showCreator, setShowCreator] = useState(false);

  return (
    <div className="h-full flex flex-col p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold dark:text-white">Tools</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowCreator(true)}>
            <Wand2 className="w-4 h-4 mr-2" />
            Generate Tool
          </Button>
          <Button variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Add Tool
          </Button>
        </div>
      </div>

      {showCreator ? (
        <ToolCreator />
      ) : (
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tools.map((tool) => (
              <div key={tool.name} className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Wrench className="text-blue-500" size={20} />
                    <h3 className="font-medium dark:text-white">{tool.name}</h3>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {tool.description}
                </p>
                {tool.metadata?.generated && (
                  <div className="mt-2">
                    <span className="text-xs px-2 py-1 rounded-full bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300">
                      AI Generated
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}