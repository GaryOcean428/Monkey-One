import React from 'react'

interface PanelProps {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
  loading?: boolean
  error?: string
  onRefresh?: () => void
}

export function Panel({
  title,
  description,
  children,
  className = '',
  loading = false,
  error,
  onRefresh,
}: PanelProps) {
  return (
    <div className={`overflow-hidden rounded-lg bg-white shadow-md ${className}`}>
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
            {description && <p className="mt-1 text-sm text-gray-600">{description}</p>}
          </div>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="rounded-full p-2 transition-colors hover:bg-gray-100"
              aria-label="Refresh"
            >
              <svg
                className="h-5 w-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
          )}
        </div>
      </div>
      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
          </div>
        ) : error ? (
          <div className="rounded-md bg-red-50 p-4 text-red-700">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm">{error}</p>
              </div>
            </div>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  )
}
