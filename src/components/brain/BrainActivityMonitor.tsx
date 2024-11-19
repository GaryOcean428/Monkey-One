import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Activity, AlertTriangle } from 'lucide-react';
import { useBrainActivity } from '@/hooks/useBrainActivity';
import { NeuralPathway } from './NeuralPathway';
import { BrainRegionCard } from './BrainRegionCard';

export function BrainActivityMonitor() {
  const { activity, regions, alerts } = useBrainActivity();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Brain className="text-purple-500" size={24} />
          <h2 className="text-lg font-semibold dark:text-white">Neural Activity</h2>
        </div>
        {alerts.length > 0 && (
          <div className="flex items-center gap-2 text-yellow-500">
            <AlertTriangle size={20} />
            <span className="text-sm">{alerts.length} Alerts</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        {regions.map((region) => (
          <BrainRegionCard key={region.id} region={region} />
        ))}
      </div>

      <div className="relative h-48 mb-4">
        <NeuralPathway activity={activity} />
      </div>

      <div className="space-y-2">
        {activity.slice(-3).map((event, index) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-700"
          >
            <Activity className="text-blue-500" size={16} />
            <span className="text-sm dark:text-white">{event.description}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
              {event.timestamp}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}