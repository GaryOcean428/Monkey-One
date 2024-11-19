import React from 'react';
import { BarChart, Clock, Zap } from 'lucide-react';

export function PerformanceMetrics() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
      <h2 className="text-lg font-semibold mb-4 dark:text-white">Performance Analytics</h2>
      
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="text-green-500" size={20} />
              <span className="font-medium dark:text-white">Success Rate</span>
            </div>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">94%</p>
          </div>
          
          <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="text-blue-500" size={20} />
              <span className="font-medium dark:text-white">Avg Response</span>
            </div>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">1.2s</p>
          </div>
        </div>

        <div className="border rounded-lg p-4 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-3">
            <BarChart className="text-gray-500 dark:text-gray-400" size={20} />
            <h3 className="font-medium dark:text-white">Agent Performance</h3>
          </div>
          
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600 dark:text-gray-400">Orchestrator</span>
                <span className="text-gray-900 dark:text-white">98%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full dark:bg-gray-700">
                <div className="h-2 bg-green-500 rounded-full" style={{ width: '98%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600 dark:text-gray-400">Code Assistant</span>
                <span className="text-gray-900 dark:text-white">92%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full dark:bg-gray-700">
                <div className="h-2 bg-blue-500 rounded-full" style={{ width: '92%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600 dark:text-gray-400">Web Surfer</span>
                <span className="text-gray-900 dark:text-white">88%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full dark:bg-gray-700">
                <div className="h-2 bg-yellow-500 rounded-full" style={{ width: '88%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}