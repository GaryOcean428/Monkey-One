import React from 'react'
import { motion } from 'framer-motion'
import { Cpu, Clock, Zap } from 'lucide-react'

export function PerformanceMetrics() {
  return (
    <div className="border-t border-gray-200 p-4 dark:border-gray-700">
      <h3 className="mb-3 text-sm font-medium dark:text-white">Performance Metrics</h3>

      <div className="grid grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-lg bg-gray-50 p-3 dark:bg-gray-700"
        >
          <div className="mb-1 flex items-center gap-2">
            <Clock className="text-blue-500" size={16} />
            <span className="text-xs text-gray-600 dark:text-gray-300">Response Time</span>
          </div>
          <span className="text-lg font-semibold dark:text-white">1.2s</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="rounded-lg bg-gray-50 p-3 dark:bg-gray-700"
        >
          <div className="mb-1 flex items-center gap-2">
            <Cpu className="text-purple-500" size={16} />
            <span className="text-xs text-gray-600 dark:text-gray-300">CPU Usage</span>
          </div>
          <span className="text-lg font-semibold dark:text-white">45%</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="rounded-lg bg-gray-50 p-3 dark:bg-gray-700"
        >
          <div className="mb-1 flex items-center gap-2">
            <Zap className="text-yellow-500" size={16} />
            <span className="text-xs text-gray-600 dark:text-gray-300">Memory</span>
          </div>
          <span className="text-lg font-semibold dark:text-white">256MB</span>
        </motion.div>
      </div>
    </div>
  )
}
