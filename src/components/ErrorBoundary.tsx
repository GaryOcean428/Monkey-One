/**
 * Comprehensive Error Boundary Component
 *
 * Catches React errors and displays user-friendly error messages
 */

import { Component, type ReactNode, type ErrorInfo } from 'react'

interface Props {
    children: ReactNode
    fallback?: ReactNode
    onError?: (error: Error, errorInfo: ErrorInfo) => void
    context?: string
}

interface State {
    hasError: boolean
    error: Error | null
    errorInfo: ErrorInfo | null
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        }
    }

    static getDerivedStateFromError(error: Error): Partial<State> {
        return {
            hasError: true,
            error,
        }
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        const { onError, context } = this.props

        // Log error details
        console.error(`Error caught by ErrorBoundary${context ? ` (${context})` : ''}:`, error, errorInfo)

        this.setState({
            error,
            errorInfo,
        })

        // Call custom error handler if provided
        if (onError)
        {
            onError(error, errorInfo)
        }
    }

    handleReset = (): void => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
        })
    }

    render(): ReactNode {
        const { hasError, error } = this.state
        const { children, fallback, context } = this.props

        if (hasError)
        {
            // Use custom fallback if provided
            if (fallback)
            {
                return fallback
            }

            // Default error UI
            return (
                <div className="flex min-h-screen items-center justify-center bg-background p-4">
                    <div className="max-w-md w-full space-y-4">
                        <div className="rounded-lg border border-destructive bg-destructive/10 p-6">
                            <div className="flex items-start space-x-3">
                                <svg
                                    className="h-6 w-6 text-destructive flex-shrink-0"
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
                                <div className="flex-1 space-y-2">
                                    <h3 className="text-lg font-semibold text-foreground">
                                        {context ? `Error in ${context}` : 'Something went wrong'}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        {error?.message || 'An unexpected error occurred'}
                                    </p>
                                    {process.env.NODE_ENV === 'development' && error?.stack && (
                                        <details className="mt-4">
                                            <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
                                                Error Details
                                            </summary>
                                            <pre className="mt-2 overflow-x-auto rounded bg-muted p-3 text-xs">
                                                {error.stack}
                                            </pre>
                                        </details>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex space-x-3">
                            <button
                                onClick={this.handleReset}
                                className="flex-1 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                            >
                                Try Again
                            </button>
                            <button
                                onClick={() => window.location.reload()}
                                className="flex-1 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                            >
                                Reload Page
                            </button>
                        </div>
                    </div>
                </div>
            )
        }

        return children
    }
}

/**
 * Hook-friendly wrapper for ErrorBoundary
 */
interface ErrorBoundaryWrapperProps {
    children: ReactNode
    context?: string
    fallback?: ReactNode
}

export function ErrorBoundaryWrapper({ children, context, fallback }: ErrorBoundaryWrapperProps) {
    return (
        <ErrorBoundary context={context} fallback={fallback}>
            {children}
        </ErrorBoundary>
    )
}
