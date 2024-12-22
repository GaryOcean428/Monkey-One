import React from 'react';
import { Cpu, HardDrive, Clock, Activity } from 'lucide-react';

export function PerformancePanel() {
  return (
    <div className="h-full flex flex-col p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold dark:text-white">System Performance</h2>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Cpu className="text-blue-500" size={20} />
            <h3 className="font-medium dark:text-white">CPU Usage</h3>
          </div>
          <p className="text-2xl font-bold dark:text-white">45%</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <HardDrive className="text-green-500" size={20} />
            <h3 className="font-medium dark:text-white">Memory</h3>
          </div>
          <p className="text-2xl font-bold dark:text-white">2.4GB</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="text-purple-500" size={20} />
            <h3 className="font-medium dark:text-white">Response Time</h3>
          </div>
          <p className="text-2xl font-bold dark:text-white">120ms</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="text-yellow-500" size={20} />
            <h3 className="font-medium dark:text-white">Active Tasks</h3>
          </div>
          <p className="text-2xl font-bold dark:text-white">8</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <h3 className="font-medium dark:text-white mb-4">Resource Usage</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600 dark:text-gray-400">CPU Load</span>
                <span className="text-gray-900 dark:text-white">45%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full dark:bg-gray-700">
                <div className="h-2 bg-blue-500 rounded-full" style={{ width: '45%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600 dark:text-gray-400">Memory Usage</span>
                <span className="text-gray-900 dark:text-white">60%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full dark:bg-gray-700">
                <div className="h-2 bg-green-500 rounded-full" style={{ width: '60%' }} />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <h3 className="font-medium dark:text-white mb-4">Task Performance</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600 dark:text-gray-400">Success Rate</span>
                <span className="text-gray-900 dark:text-white">92%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full dark:bg-gray-700">
                <div className="h-2 bg-purple-500 rounded-full" style={{ width: '92%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600 dark:text-gray-400">Response Time</span>
                <span className="text-gray-900 dark:text-white">120ms</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full dark:bg-gray-700">
                <div className="h-2 bg-yellow-500 rounded-full" style={{ width: '80%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}