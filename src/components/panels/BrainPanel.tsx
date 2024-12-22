import React from 'react';
import { Brain, Activity, Zap, Heart, Gauge } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAgents } from '@/hooks/useAgents';

export function BrainPanel() {
  const { agents } = useAgents();

  const brainAgents = agents.filter(agent => 
    ['amygdala', 'cerebellum', 'thalamus', 'cortex', 'hippocampus'].includes(agent.type)
  );

  return (
    <div className="h-full flex flex-col p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold dark:text-white">Neural Network</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {brainAgents.length} Active Regions
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Amygdala Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-3">
            <Heart className="text-red-500" size={20} />
            <h3 className="font-medium dark:text-white">Amygdala</h3>
          </div>
          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600 dark:text-gray-400">Fear Response</span>
                <span className="text-gray-900 dark:text-white">45%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full dark:bg-gray-700">
                <div className="h-2 bg-red-500 rounded-full" style={{ width: '45%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600 dark:text-gray-400">Reward Processing</span>
                <span className="text-gray-900 dark:text-white">72%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full dark:bg-gray-700">
                <div className="h-2 bg-green-500 rounded-full" style={{ width: '72%' }} />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Cerebellum Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-3">
            <Activity className="text-blue-500" size={20} />
            <h3 className="font-medium dark:text-white">Cerebellum</h3>
          </div>
          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600 dark:text-gray-400">Motor Learning</span>
                <span className="text-gray-900 dark:text-white">83%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full dark:bg-gray-700">
                <div className="h-2 bg-blue-500 rounded-full" style={{ width: '83%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600 dark:text-gray-400">Pattern Refinement</span>
                <span className="text-gray-900 dark:text-white">67%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full dark:bg-gray-700">
                <div className="h-2 bg-purple-500 rounded-full" style={{ width: '67%' }} />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Neural Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-3">
            <Brain className="text-purple-500" size={20} />
            <h3 className="font-medium dark:text-white">Neural Performance</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <Zap className="w-5 h-5 text-yellow-500 mx-auto mb-1" />
              <span className="block text-sm text-gray-600 dark:text-gray-400">Response Time</span>
              <span className="text-lg font-semibold dark:text-white">124ms</span>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <Gauge className="w-5 h-5 text-green-500 mx-auto mb-1" />
              <span className="block text-sm text-gray-600 dark:text-gray-400">Accuracy</span>
              <span className="text-lg font-semibold dark:text-white">92%</span>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="mt-4 bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
        <h3 className="font-medium dark:text-white mb-3">Neural Activity Timeline</h3>
        <div className="space-y-3">
          {[
            { time: '2s ago', event: 'Amygdala processed emotional response', type: 'emotion' },
            { time: '5s ago', event: 'Cerebellum refined motor pattern', type: 'motor' },
            { time: '12s ago', event: 'Memory consolidation completed', type: 'memory' }
          ].map((activity, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${
                activity.type === 'emotion' ? 'bg-red-500' :
                activity.type === 'motor' ? 'bg-blue-500' :
                'bg-purple-500'
              }`} />
              <span className="text-sm text-gray-500 dark:text-gray-400 w-16">
                {activity.time}
              </span>
              <span className="text-sm dark:text-white">
                {activity.event}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}