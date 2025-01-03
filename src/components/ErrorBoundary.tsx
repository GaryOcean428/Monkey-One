import React, { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="rounded border border-red-500 bg-red-50 p-4 text-red-900">
          <h2 className="mb-2 text-lg font-semibold">Something went wrong</h2>
          <p className="text-sm">{this.state.error?.message}</p>
        </div>
      )
    }

    return this.props.children
  }
}
