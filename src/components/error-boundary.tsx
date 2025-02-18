import * as React from 'react'
import { Card } from './ui/card'
import { Button } from './ui/button'

interface ErrorBoundaryState {
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error, errorInfo: null }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo,
    })

    // Log error to your error reporting service
    console.error('Error caught by ErrorBoundary:', error, errorInfo)
  }

  render() {
    if (this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <Card className="m-4 p-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <h2 className="text-xl font-semibold">Something went wrong</h2>
            <p className="text-muted-foreground">
              {this.state.error.message || 'An unexpected error occurred'}
            </p>
            <div className="space-x-2">
              <Button
                variant="secondary"
                onClick={() => window.location.reload()}
              >
                Reload Page
              </Button>
              <Button
                variant="outline"
                onClick={() => window.history.back()}
              >
                Go Back
              </Button>
            </div>
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-4 cursor-pointer text-left">
                <summary className="text-sm text-muted-foreground">Error Details</summary>
                <pre className="mt-2 max-h-96 overflow-auto rounded-lg bg-muted p-4 text-xs">
                  <code>{this.state.error.stack}</code>
                  {this.state.errorInfo && (
                    <code>{this.state.errorInfo.componentStack}</code>
                  )}
                </pre>
              </details>
            )}
          </div>
        </Card>
      )
    }

    return this.props.children
  }
}
