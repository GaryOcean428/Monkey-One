/**
 * Toolhouse-specific Error Boundary
 * 
 * Specialized error boundary for Toolhouse integration components
 */

import { Component, type ReactNode, type ErrorInfo } from 'react'
import { logger } from '../../utils/logger'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ToolhouseErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const { onError } = this.props

    // Log Toolhouse-specific error
    logger.error('Toolhouse Error:', {
      error: error.message,
      componentStack: errorInfo.componentStack,
      stack: error.stack,
    })

    if (onError) {
      onError(error, errorInfo)
    }

    this.setState({
      error,
    })
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
    })
  }

  render(): ReactNode {
    const { hasError, error } = this.state
    const { children, fallback } = this.props

    if (hasError) {
      if (fallback) {
        return fallback
      }

      return (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <div className="mb-4 text-red-500">
            <svg
              className="mx-auto h-12 w-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h3 className="mb-2 text-lg font-semibold">Toolhouse Error</h3>
          <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
            {error?.message || 'An error occurred with Toolhouse integration'}
          </p>
          <button
            onClick={this.handleReset}
            className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      )
    }

    return children
  }
}
