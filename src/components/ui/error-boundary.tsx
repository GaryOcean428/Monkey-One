import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Alert, AlertTitle, AlertDescription } from './alert'
import { Button } from './button'
import { ReloadIcon } from '@radix-ui/react-icons'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Application error:', error, errorInfo)
    this.props.onError?.(error, errorInfo)
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  private handleReload = () => {
    window.location.reload()
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <Alert variant="destructive" className="my-4">
          <AlertTitle>Something went wrong</AlertTitle>
          <AlertDescription>
            <div className="mt-2">
              {this.state.error?.message || 'An unexpected error occurred'}
            </div>
            <div className="mt-4 space-x-4">
              <Button variant="outline" size="sm" onClick={this.handleRetry}>
                <ReloadIcon className="mr-2 h-4 w-4" />
                Try again
              </Button>
              <Button variant="outline" size="sm" onClick={this.handleReload}>
                <ReloadIcon className="mr-2 h-4 w-4" />
                Reload page
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )
    }

    return this.props.children
  }
}
