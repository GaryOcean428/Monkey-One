import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Split,
  Code2,
  GitBranch,
  Play,
  Save,
  Settings2,
  RefreshCw,
  Filter,
  SortAsc,
  SortDesc,
} from 'lucide-react'
import { CodeEditor } from './CodeEditor'
import { InsightPanel } from './InsightPanel'
import { ModelSelector } from './ModelSelector'
import { PerformanceMetrics } from './PerformanceMetrics'
import { useCodeProcessor } from '../../hooks/useCodeProcessor'
import { Button } from '../ui/button'
import { toast } from '../ui/toast'

export function CodingWorkspace() {
  const [code, setCode] = useState('')
  const [showInsights, setShowInsights] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { processCodingTask, isProcessing } = useCodeProcessor()
  const [filterType, setFilterType] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  const handleProcess = async () => {
    if (!code.trim()) {
      toast.error('Please enter some code first')
      return
    }

    try {
      setError(null)
      const result = await processCodingTask(code)
      setCode(result.code)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      toast.error('Failed to process code')
    }
  }

  const handleRefresh = () => {
    // Logic to refresh the workspace
  }

  const handleFilter = () => {
    // Logic to filter workspace by type
  }

  const handleSort = () => {
    // Logic to sort workspace by name
  }

  return (
    <div className="flex h-full flex-col bg-gray-50 dark:bg-gray-900">
      <div className="border-b border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <ModelSelector />
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <GitBranch className="mr-2 h-4 w-4" />
                main
              </Button>
              <Button variant="outline" size="sm">
                <Save className="mr-2 h-4 w-4" />
                Save
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowInsights(!showInsights)}>
              <Split className="mr-2 h-4 w-4" />
              {showInsights ? 'Hide' : 'Show'} Insights
            </Button>
            <Button variant="default" size="sm" onClick={handleProcess} disabled={isProcessing}>
              {isProcessing ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  <Code2 className="mr-2 h-4 w-4" />
                </motion.div>
              ) : (
                <Play className="mr-2 h-4 w-4" />
              )}
              {isProcessing ? 'Processing...' : 'Run'}
            </Button>
            <Button variant="ghost" size="sm">
              <Settings2 className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh Workspace
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
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className={`flex-1 ${showInsights ? 'w-2/3' : 'w-full'}`}>
          <CodeEditor value={code} onChange={setCode} language="typescript" theme="vs-dark" />
        </div>

        {showInsights && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 'auto', opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="w-1/3 border-l border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-800"
          >
            <div className="flex h-full flex-col">
              <InsightPanel />
              <PerformanceMetrics />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
