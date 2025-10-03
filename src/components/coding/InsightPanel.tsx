import React from 'react'
import { motion } from 'framer-motion'
import {
  AlertTriangle,
  CheckCircle,
  Code,
  GitCommit,
  RefreshCw,
  Filter,
  SortAsc,
  SortDesc,
} from 'lucide-react'
import { Button } from '../ui/button'

export function InsightPanel() {
  const [filterType, setFilterType] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  const handleRefresh = () => {
    // Logic to refresh the insights
  }

  const handleFilter = () => {
    // Logic to filter insights by type
  }

  const handleSort = () => {
    // Logic to sort insights by name
  }

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="mb-4 flex justify-between">
        <Button variant="outline" size="sm" onClick={handleRefresh}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh Insights
        </Button>
        <Button variant="outline" size="sm" onClick={handleFilter}>
          <Filter className="mr-2 h-4 w-4" />
          Filter by Type
        </Button>
        <Button variant="outline" size="sm" onClick={handleSort}>
          {sortOrder === 'asc' ? (
            <SortAsc className="mr-2 h-4 w-4" />
          ) : (
            <SortDesc className="mr-2 h-4 w-4" />
          )}
          Sort by Name
        </Button>
      </div>
      <h3 className="mb-4 text-lg font-semibold dark:text-white">Code Insights</h3>

      <div className="space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-700"
        >
          <div className="mb-2 flex items-center gap-2">
            <Code className="text-blue-500" size={20} />
            <h4 className="font-medium dark:text-white">Code Quality</h4>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-300">Complexity</span>
              <span className="text-sm font-medium dark:text-white">Low</span>
            </div>
            <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-600">
              <div className="h-2 rounded-full bg-green-500" style={{ width: '30%' }} />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-700"
        >
          <div className="mb-2 flex items-center gap-2">
            <GitCommit className="text-purple-500" size={20} />
            <h4 className="font-medium dark:text-white">Model Consensus</h4>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="text-green-500" size={16} />
              <span className="text-sm dark:text-gray-300">Qwen and Granite agree on solution</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-700"
        >
          <div className="mb-2 flex items-center gap-2">
            <AlertTriangle className="text-yellow-500" size={20} />
            <h4 className="font-medium dark:text-white">Suggestions</h4>
          </div>
          <ul className="space-y-2 text-sm dark:text-gray-300">
            <li className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-yellow-500" />
              Consider adding error handling
            </li>
            <li className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-yellow-500" />
              Add input validation
            </li>
          </ul>
        </motion.div>
      </div>
    </div>
  )
}
