import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, FileText, Calendar, Link } from 'lucide-react';
import { Button } from '../ui/button';
import type { Task, Action } from '../../types';

interface TaskPanelProps {
  task: Task;
  actions: Action[];
}

export function TaskPanel({ task, actions }: TaskPanelProps) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50"
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold dark:text-white">Current Task</h3>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Started {new Date(task.startTime).toLocaleTimeString()}
              </span>
              <div className={`px-2 py-1 rounded-full text-sm ${
                task.status === 'in_progress' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                task.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
              }`}>
                {task.status.replace('_', ' ').charAt(0).toUpperCase() + task.status.slice(1)}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3 bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
              <FileText className="text-blue-500 shrink-0" />
              <div>
                <h4 className="font-medium dark:text-white">{task.title}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{task.description}</p>
              </div>
            </div>

            {actions.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                <h4 className="font-medium mb-3 dark:text-white">Pending Actions</h4>
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
                          className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <XCircle size={16} />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-green-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
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
              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
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
  );
}