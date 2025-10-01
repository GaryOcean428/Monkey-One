import * as React from 'react'
import { SimpleErrorBoundary } from './simple-error-boundary'

interface ErrorBoundaryWrapperProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  context?: string
}

/**
 * Enhanced error boundary wrapper that provides context-aware error handling
 */
export function ErrorBoundaryWrapper({
  children,
  fallback,
  context = 'component',
}: ErrorBoundaryWrapperProps) {
  const contextualFallback = fallback || (
    <div
      style={{
        padding: '20px',
        textAlign: 'center',
        fontFamily: 'system-ui, sans-serif',
        color: '#ef4444',
        border: '1px solid #fecaca',
        borderRadius: '8px',
        backgroundColor: '#fef2f2',
        margin: '10px',
      }}
    >
      <h3>Error in {context}</h3>
      <p>This {context} encountered an error and couldn't render properly.</p>
      <button
        onClick={() => window.location.reload()}
        style={{
          marginTop: '10px',
          padding: '8px 16px',
          background: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        Reload Page
      </button>
    </div>
  )

  return <SimpleErrorBoundary fallback={contextualFallback}>{children}</SimpleErrorBoundary>
}
