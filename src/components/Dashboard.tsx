import { useAuth } from '../hooks/useAuth'
import { Panel } from './ui/Panel'
import { useState } from 'react'
import { MemoryStats } from '../lib/types/memory'
import { DocumentStats } from '../lib/types/document'
import { WorkflowStats } from '../lib/types/workflow'
import { getMemoryStats, getDocumentStats, getWorkflowStats } from '../lib/api/stats'

export function Dashboard() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [memoryStats, setMemoryStats] = useState<MemoryStats>({
    totalItems: 0,
    byType: {
      text: 0,
      code: 0,
      image: 0,
      audio: 0,
      embedding: 0,
    },
    averageVectorDimensions: 384,
    totalStorageSize: 0,
    lastUpdated: Date.now(),
    topSources: [],
    topTags: [],
  })

  const [documentStats, setDocumentStats] = useState<DocumentStats>({
    totalDocuments: 0,
    totalSize: 0,
    byType: {
      text: 0,
      markdown: 0,
      pdf: 0,
      doc: 0,
      docx: 0,
      code: 0,
      json: 0,
      yaml: 0,
    },
    byStatus: {
      pending: 0,
      processing: 0,
      processed: 0,
      failed: 0,
    },
    averageProcessingTime: 0,
    vectorDimensions: 384,
    lastUpdated: Date.now(),
  })

  const [workflowStats, setWorkflowStats] = useState<WorkflowStats>({
    totalWorkflows: 0,
    activeWorkflows: 0,
    completedWorkflows: 0,
    failedWorkflows: 0,
    averageExecutionTime: 0,
    successRate: 0,
  })

  const handleRefresh = async () => {
    setLoading(true)
    setError(null)
    try {
      const [memory, documents, workflows] = await Promise.all([
        getMemoryStats(),
        getDocumentStats(),
        getWorkflowStats(),
      ])

      setMemoryStats(memory)
      setDocumentStats(documents)
      setWorkflowStats(workflows)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh stats')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Welcome, {user?.email}</h1>
          <button
            onClick={handleRefresh}
            className="rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
          >
            Refresh All
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* System Status Panel */}
          <Panel
            title="System Status"
            description="Real-time metrics and monitoring"
            loading={loading}
            error={error || undefined}
            className="col-span-full"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-lg bg-green-50 p-4">
                <h3 className="text-sm font-medium text-green-800">Memory Usage</h3>
                <p className="mt-2 text-3xl font-semibold text-green-900">
                  {memoryStats.totalItems}
                </p>
                <p className="mt-1 text-sm text-green-700">Total Items</p>
              </div>
              <div className="rounded-lg bg-blue-50 p-4">
                <h3 className="text-sm font-medium text-blue-800">Documents</h3>
                <p className="mt-2 text-3xl font-semibold text-blue-900">
                  {documentStats.totalDocuments}
                </p>
                <p className="mt-1 text-sm text-blue-700">Total Files</p>
              </div>
              <div className="rounded-lg bg-purple-50 p-4">
                <h3 className="text-sm font-medium text-purple-800">Workflows</h3>
                <p className="mt-2 text-3xl font-semibold text-purple-900">
                  {workflowStats.totalWorkflows}
                </p>
                <p className="mt-1 text-sm text-purple-700">Total Workflows</p>
              </div>
            </div>
          </Panel>

          {/* Memory Panel */}
          <Panel
            title="Memory"
            description="Vector storage statistics"
            loading={loading}
            error={error || undefined}
          >
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-700">Storage Usage</h3>
                <p className="mt-1 text-2xl font-semibold text-gray-900">
                  {(memoryStats.totalStorageSize / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700">Vector Dimensions</h3>
                <p className="mt-1 text-lg text-gray-900">{memoryStats.averageVectorDimensions}</p>
              </div>
            </div>
          </Panel>

          {/* Documents Panel */}
          <Panel
            title="Documents"
            description="Document processing status"
            loading={loading}
            error={error || undefined}
          >
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-700">Processing</h3>
                  <p className="mt-1 text-2xl font-semibold text-gray-900">
                    {documentStats.byStatus.processing}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-700">Completed</h3>
                  <p className="mt-1 text-2xl font-semibold text-gray-900">
                    {documentStats.byStatus.processed}
                  </p>
                </div>
              </div>
            </div>
          </Panel>

          {/* Workflow Panel */}
          <Panel
            title="Workflows"
            description="Workflow execution metrics"
            loading={loading}
            error={error || undefined}
          >
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-700">Active</h3>
                  <p className="mt-1 text-2xl font-semibold text-gray-900">
                    {workflowStats.activeWorkflows}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-700">Success Rate</h3>
                  <p className="mt-1 text-2xl font-semibold text-gray-900">
                    {workflowStats.successRate.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  )
}
