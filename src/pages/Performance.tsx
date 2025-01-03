import React from 'react'
import { Button } from '../components/ui/button'
import styles from './Performance.module.css'

export const PerformancePanel: React.FC = () => {
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Performance Metrics</h1>
        <Button>Export Data</Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">System Health</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">CPU Usage</p>
              <div className={styles.progressBar}>
                <div className={`${styles.progressBarFill} ${styles.cpu}`} />
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500">Memory Usage</p>
              <div className={styles.progressBar}>
                <div className={`${styles.progressBarFill} ${styles.memory}`} />
              </div>
            </div>
          </div>
        </div>

        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Response Times</h2>
          <div className="space-y-2">
            <p className="text-sm text-gray-500">Average: 150ms</p>
            <p className="text-sm text-gray-500">Peak: 350ms</p>
            <p className="text-sm text-gray-500">95th Percentile: 250ms</p>
          </div>
        </div>
      </div>
    </div>
  )
}
