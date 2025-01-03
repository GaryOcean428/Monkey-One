import React from 'react'
import { Button } from '../components/ui/button'
import { BasePanel } from '../components/panels/BasePanel'
import styles from './Performance.module.css'

export const PerformancePanel: React.FC = () => {
  const actions = (
    <Button variant="outline" size="sm">
      Export Data
    </Button>
  )

  return (
    <div className="container mx-auto p-6">
      <BasePanel
        title="Performance Metrics"
        description="System performance and resource utilization metrics"
        actions={actions}
      >
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-lg border p-6">
            <h2 className="mb-4 text-xl font-semibold">System Health</h2>
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

          <div className="rounded-lg border p-6">
            <h2 className="mb-4 text-xl font-semibold">Response Times</h2>
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Average: 150ms</p>
              <p className="text-sm text-gray-500">Peak: 350ms</p>
              <p className="text-sm text-gray-500">95th Percentile: 250ms</p>
            </div>
          </div>
        </div>
      </BasePanel>
    </div>
  )
}
