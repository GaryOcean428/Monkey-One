import React from 'react';
import { motion } from 'framer-motion';
import { Circle, ArrowRight, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import type { WorkflowDefinition } from '@/types';

interface WorkflowVisualizerProps {
  workflow: WorkflowDefinition;
}

export function WorkflowVisualizer({ workflow }: WorkflowVisualizerProps) {
  return (
    <div className="h-full flex flex-col p-6 overflow-auto">
      <div className="flex items-start gap-8">
        {workflow.steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex flex-col items-center"
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                step.status === 'completed' ? 'bg-green-100 dark:bg-green-900/20' :
                step.status === 'failed' ? 'bg-red-100 dark:bg-red-900/20' :
                step.status === 'in_progress' ? 'bg-blue-100 dark:bg-blue-900/20' :
                'bg-gray-100 dark:bg-gray-800'
              }`}>
                {step.status === 'completed' && <CheckCircle className="w-6 h-6 text-green-500" />}
                {step.status === 'failed' && <XCircle className="w-6 h-6 text-red-500" />}
                {step.status === 'in_progress' && (
                  <Circle className="w-6 h-6 text-blue-500 animate-pulse" />
                )}
                {step.status === 'pending' && <Circle className="w-6 h-6 text-gray-400" />}
              </div>
              
              <div className="mt-4 text-center">
                <p className="font-medium dark:text-white">{step.action}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {workflow.team.find(t => t.id === step.agentId)?.role}
                </p>
              </div>

              {step.error && (
                <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/10 rounded-lg flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  <span className="text-xs text-red-700 dark:text-red-300">{step.error}</span>
                </div>
              )}
            </motion.div>

            {index < workflow.steps.length - 1 && (
              <ArrowRight className="w-6 h-6 text-gray-400 mt-3" />
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <h3 className="font-medium dark:text-white mb-2">Success Metrics</h3>
          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600 dark:text-gray-400">Accuracy</span>
                <span className="text-gray-900 dark:text-white">
                  {workflow.metadata.successMetrics.accuracy * 100}%
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full dark:bg-gray-700">
                <div
                  className="h-2 bg-green-500 rounded-full"
                  style={{ width: `${workflow.metadata.successMetrics.accuracy * 100}%` }}
                />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600 dark:text-gray-400">Efficiency</span>
                <span className="text-gray-900 dark:text-white">
                  {workflow.metadata.successMetrics.efficiency * 100}%
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full dark:bg-gray-700">
                <div
                  className="h-2 bg-blue-500 rounded-full"
                  style={{ width: `${workflow.metadata.successMetrics.efficiency * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600 dark:text-gray-400">Reliability</span>
                <span className="text-gray-900 dark:text-white">
                  {workflow.metadata.successMetrics.reliability * 100}%
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full dark:bg-gray-700">
                <div
                  className="h-2 bg-purple-500 rounded-full"
                  style={{ width: `${workflow.metadata.successMetrics.reliability * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <h3 className="font-medium dark:text-white mb-2">Team Performance</h3>
          <div className="space-y-3">
            {workflow.team.map(member => (
              <div key={member.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    member.status === 'active' ? 'bg-green-500' :
                    member.status === 'failed' ? 'bg-red-500' :
                    'bg-gray-400'
                  }`} />
                  <span className="text-sm dark:text-white">{member.role}</span>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {member.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <h3 className="font-medium dark:text-white mb-2">Workflow Details</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Created</span>
              <span className="text-gray-900 dark:text-white">
                {new Date(workflow.created).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Last Updated</span>
              <span className="text-gray-900 dark:text-white">
                {new Date(workflow.updated).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Iterations</span>
              <span className="text-gray-900 dark:text-white">
                {workflow.metadata.iterationCount}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}