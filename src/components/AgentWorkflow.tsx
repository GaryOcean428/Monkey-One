import React, { useState } from 'react';
import { Save, Play, Pause, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';

export function AgentWorkflow() {
  const [isRunning, setIsRunning] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const templates = [
    { id: '1', name: 'Code Review' },
    { id: '2', name: 'Bug Fix' },
    { id: '3', name: 'Feature Implementation' }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold dark:text-white">Workflow Management</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsRunning(!isRunning)}
          >
            {isRunning ? <Pause size={16} /> : <Play size={16} />}
            {isRunning ? 'Pause' : 'Start'}
          </Button>
          <Button variant="outline" size="sm">
            <Save size={16} className="mr-1" />
            Save Template
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw size={16} className="mr-1" />
            Reset
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex gap-2">
          {templates.map(template => (
            <button
              key={template.id}
              onClick={() => setSelectedTemplate(template.id)}
              className={`px-3 py-1 rounded-full text-sm
                ${selectedTemplate === template.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                }`}
            >
              {template.name}
            </button>
          ))}
        </div>

        <div className="border rounded-lg p-4 dark:border-gray-700">
          <h3 className="font-medium mb-2 dark:text-white">Active Workflow</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              Task Analysis
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
              Code Generation
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600"></div>
              Testing
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}