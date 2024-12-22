import React from 'react';
import { BarChart, Activity, Users, MessageSquare } from 'lucide-react';

export function DashboardPanel() {
  return (
    <div className="h-full p-4 overflow-y-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="text-blue-500" size={20} />
            <h3 className="font-medium dark:text-white">Active Agents</h3>
          </div>
          <p className="text-2xl font-bold dark:text-white">12</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="text-green-500" size={20} />
            <h3 className="font-medium dark:text-white">Total Conversations</h3>
          </div>
          <p className="text-2xl font-bold dark:text-white">1,234</p>
        </div>

        {/* Add more dashboard widgets */}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <h3 className="font-medium dark:text-white mb-4">Recent Activity</h3>
          {/* Add activity chart */}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <h3 className="font-medium dark:text-white mb-4">Agent Performance</h3>
          {/* Add performance metrics */}
        </div>
      </div>
    </div>
  );
}