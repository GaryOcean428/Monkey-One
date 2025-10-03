import React from 'react'
import { Brain, Activity, Zap, Heart, Gauge } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAgents } from '../../hooks/useAgents'

export function BrainPanel() {
  const { agents } = useAgents()

  const brainAgents = agents.filter(agent =>
    ['amygdala', 'cerebellum', 'thalamus', 'cortex', 'hippocampus'].includes(agent.type)
  )

  return (
    <div className="flex h-full flex-col p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold dark:text-white">Neural Network</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {brainAgents.length} Active Regions
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Amygdala Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800"
        >
          <div className="mb-3 flex items-center gap-2">
            <Heart className="text-red-500" size={20} />
            <h3 className="font-medium dark:text-white">Amygdala</h3>
          </div>
          <div className="space-y-2">
            <div>
              <div className="mb-1 flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Fear Response</span>
                <span className="text-gray-900 dark:text-white">45%</span>
              </div>
              <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-700">
                <div className="h-2 rounded-full bg-red-500" style={{ width: '45%' }} />
              </div>
            </div>
            <div>
              <div className="mb-1 flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Reward Processing</span>
                <span className="text-gray-900 dark:text-white">72%</span>
              </div>
              <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-700">
                <div className="h-2 rounded-full bg-green-500" style={{ width: '72%' }} />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Cerebellum Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800"
        >
          <div className="mb-3 flex items-center gap-2">
            <Activity className="text-blue-500" size={20} />
            <h3 className="font-medium dark:text-white">Cerebellum</h3>
          </div>
          <div className="space-y-2">
            <div>
              <div className="mb-1 flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Motor Learning</span>
                <span className="text-gray-900 dark:text-white">83%</span>
              </div>
              <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-700">
                <div className="h-2 rounded-full bg-blue-500" style={{ width: '83%' }} />
              </div>
            </div>
            <div>
              <div className="mb-1 flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Pattern Refinement</span>
                <span className="text-gray-900 dark:text-white">67%</span>
              </div>
              <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-700">
                <div className="h-2 rounded-full bg-purple-500" style={{ width: '67%' }} />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Neural Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800"
        >
          <div className="mb-3 flex items-center gap-2">
            <Brain className="text-purple-500" size={20} />
            <h3 className="font-medium dark:text-white">Neural Performance</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-gray-50 p-3 text-center dark:bg-gray-700">
              <Zap className="mx-auto mb-1 h-5 w-5 text-yellow-500" />
              <span className="block text-sm text-gray-600 dark:text-gray-400">Response Time</span>
              <span className="text-lg font-semibold dark:text-white">124ms</span>
            </div>
            <div className="rounded-lg bg-gray-50 p-3 text-center dark:bg-gray-700">
              <Gauge className="mx-auto mb-1 h-5 w-5 text-green-500" />
              <span className="block text-sm text-gray-600 dark:text-gray-400">Accuracy</span>
              <span className="text-lg font-semibold dark:text-white">92%</span>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="mt-4 rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
        <h3 className="mb-3 font-medium dark:text-white">Neural Activity Timeline</h3>
        <div className="space-y-3">
          {[
            { time: '2s ago', event: 'Amygdala processed emotional response', type: 'emotion' },
            { time: '5s ago', event: 'Cerebellum refined motor pattern', type: 'motor' },
            { time: '12s ago', event: 'Memory consolidation completed', type: 'memory' },
          ].map((activity, index) => (
            <div key={index} className="flex items-center gap-3">
              <div
                className={`h-2 w-2 rounded-full ${
                  activity.type === 'emotion'
                    ? 'bg-red-500'
                    : activity.type === 'motor'
                      ? 'bg-blue-500'
                      : 'bg-purple-500'
                }`}
              />
              <span className="w-16 text-sm text-gray-500 dark:text-gray-400">{activity.time}</span>
              <span className="text-sm dark:text-white">{activity.event}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
