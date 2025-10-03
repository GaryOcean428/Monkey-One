import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Brain, Activity, AlertTriangle, RefreshCw, Filter, SortAsc, SortDesc } from 'lucide-react'
import { useBrainActivity } from '../../hooks/useBrainActivity'
import { NeuralPathway } from './NeuralPathway'
import { BrainRegionCard } from './BrainRegionCard'

export function BrainActivityMonitor() {
  const { activity, regions, alerts } = useBrainActivity()
  const [filterRegion, setFilterRegion] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  const filteredActivity = filterRegion
    ? activity.filter(event => event.region === filterRegion)
    : activity

  const sortedActivity = filteredActivity.sort((a, b) => {
    if (sortOrder === 'asc') {
      return a.value - b.value
    } else {
      return b.value - a.value
    }
  })

  return (
    <div className="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
      <div className="mb-4 flex items-center justify-between">
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

      <div className="mb-4 flex justify-between">
        <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh Activity
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setFilterRegion(filterRegion ? null : 'region')}
        >
          <Filter className="mr-2 h-4 w-4" />
          {filterRegion ? 'Clear Filter' : 'Filter by Region'}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
        >
          {sortOrder === 'asc' ? (
            <SortAsc className="mr-2 h-4 w-4" />
          ) : (
            <SortDesc className="mr-2 h-4 w-4" />
          )}
          Sort by Value
        </Button>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {regions.map(region => (
          <BrainRegionCard key={region.id} region={region} />
        ))}
      </div>

      <div className="relative mb-4 h-48">
        <NeuralPathway activity={activity} />
      </div>

      <div className="space-y-2">
        {sortedActivity.slice(-3).map((event, index) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center gap-2 rounded-lg bg-gray-50 p-2 dark:bg-gray-700"
          >
            <Activity className="text-blue-500" size={16} />
            <span className="text-sm dark:text-white">{event.description}</span>
            <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">
              {event.timestamp}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
