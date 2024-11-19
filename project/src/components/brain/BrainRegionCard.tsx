import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Brain, AlertTriangle } from 'lucide-react';

interface BrainRegion {
  id: string;
  name: string;
  status: 'active' | 'idle' | 'learning';
  activity: number;
  alerts?: string[];
}

interface BrainRegionCardProps {
  region: BrainRegion;
}

export function BrainRegionCard({ region }: BrainRegionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Brain className="text-purple-500" size={20} />
          <h3 className="font-medium dark:text-white">{region.name}</h3>
        </div>
        {region.alerts?.length ? (
          <div className="flex items-center gap-1 text-yellow-500">
            <AlertTriangle size={16} />
            <span className="text-xs">{region.alerts.length}</span>
          </div>
        ) : null}
      </div>

      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600 dark:text-gray-400">Activity</span>
            <span className="text-gray-900 dark:text-white">
              {Math.round(region.activity * 100)}%
            </span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full dark:bg-gray-700">
            <div
              className="h-2 bg-purple-500 rounded-full transition-all duration-300"
              style={{ width: `${region.activity * 100}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Activity
            className={`${
              region.status === 'active'
                ? 'text-green-500'
                : region.status === 'learning'
                ? 'text-blue-500'
                : 'text-gray-400'
            }`}
            size={16}
          />
          <span className="text-sm capitalize text-gray-600 dark:text-gray-400">
            {region.status}
          </span>
        </div>
      </div>
    </motion.div>
  );
}