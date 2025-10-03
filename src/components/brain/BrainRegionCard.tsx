import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Activity, Brain, AlertTriangle, RefreshCw, Filter, SortAsc, SortDesc } from 'lucide-react'

interface BrainRegion {
  id: string
  name: string
  status: 'active' | 'idle' | 'learning'
  activity: number
  alerts?: string[]
}

interface BrainRegionCardProps {
  region: BrainRegion
}

export function BrainRegionCard({ region }: BrainRegionCardProps) {
  const [filterStatus, setFilterStatus] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  const filteredRegions = filterStatus ? [region].filter(r => r.status === filterStatus) : [region]

  const sortedRegions = filteredRegions.sort((a, b) => {
    if (sortOrder === 'asc') {
      return a.name.localeCompare(b.name)
    } else {
      return b.name.localeCompare(a.name)
    }
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800"
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="text-purple-500" size={20} />
          <h3 className="font-medium dark:text-white">{region.name}</h3>
        </div>
        {region.alerts?.length ? (
          <div className="flex items-center gap-1 text-yellow-500">
            <AlertTriangle size={16} />
            <span className="text-xs">{region.alerts.length}</span>
          </div>
        ) : null}
      </div>

      <div className="mb-4 flex justify-between">
        <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh Status
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setFilterStatus(filterStatus ? null : 'active')}
        >
          <Filter className="mr-2 h-4 w-4" />
          {filterStatus ? 'Clear Filter' : 'Filter by Status'}
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
          Sort by Name
        </Button>
      </div>

      <div className="space-y-3">
        <div>
          <div className="mb-1 flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Activity</span>
            <span className="text-gray-900 dark:text-white">
              {Math.round(region.activity * 100)}%
            </span>
          </div>
          <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-700">
            <div
              className="h-2 rounded-full bg-purple-500 transition-all duration-300"
              style={{ width: `${region.activity * 100}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Activity
            className={`${
              region.status === 'active'
                ? 'text-green-500'
                : region.status === 'learning'
                  ? 'text-blue-500'
                  : 'text-gray-400'
            }`}
            size={16}
          />
          <span className="text-sm text-gray-600 capitalize dark:text-gray-400">
            {region.status}
          </span>
        </div>
      </div>
    </motion.div>
  )
}
