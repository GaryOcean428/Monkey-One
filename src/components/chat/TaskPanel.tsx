import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, AlertTriangle, FileText, Calendar, Link } from 'lucide-react'
import { Button } from '../ui/button'
import type { Task, Action } from '../../types'

interface TaskPanelProps {
  task: Task
  actions: Action[]
}

export function TaskPanel({ task, actions }: TaskPanelProps) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="border-t border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50"
      >
        <div className="p-4">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold dark:text-white">Current Task</h3>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Started {new Date(task.startTime).toLocaleTimeString()}
              </span>
              <div
                className={`rounded-full px-2 py-1 text-sm ${
                  task.status === 'in_progress'
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                    : task.status === 'completed'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                      : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                }`}
              >
                {task.status.replace('_', ' ').charAt(0).toUpperCase() + task.status.slice(1)}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
              <FileText className="shrink-0 text-blue-500" />
              <div>
                <h4 className="font-medium dark:text-white">{task.title}</h4>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{task.description}</p>
              </div>
            </div>

            <div className="mb-4 flex justify-between">
              <Button variant="outline" size="sm">
                Refresh Tasks
              </Button>
              <Button variant="outline" size="sm">
                Filter by Type
              </Button>
              <Button variant="outline" size="sm">
                Sort by Name
              </Button>
            </div>

            {actions.length > 0 && (
              <div className="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
                <h4 className="mb-3 font-medium dark:text-white">Pending Actions</h4>
                <div className="space-y-3">
                  {actions.map(action => (
                    <div key={action.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {action.type === 'file' && <FileText size={16} />}
                        {action.type === 'schedule' && <Calendar size={16} />}
                        {action.type === 'integration' && <Link size={16} />}
                        <span className="text-sm dark:text-gray-300">{action.description}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                        >
                          <XCircle size={16} />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-green-500 hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-900/20"
                        >
                          <CheckCircle size={16} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {task.warnings && task.warnings.length > 0 && (
              <div className="rounded-lg bg-yellow-50 p-4 dark:bg-yellow-900/20">
                <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-500">
                  <AlertTriangle size={16} />
                  <h4 className="font-medium">Warnings</h4>
                </div>
                <ul className="mt-2 space-y-1">
                  {task.warnings.map((warning, index) => (
                    <li key={index} className="text-sm text-yellow-600 dark:text-yellow-400">
                      • {warning}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
