import * as React from 'react'
import { SuspenseBoundary } from '@/components/ui/suspense-boundary'
import { PrivateRoute } from '@/components/Auth/PrivateRoute'
import { RouteConfig } from '@/config/routes'

interface RouteWrapperProps {
  config: RouteConfig
  children: React.ReactElement
}

/**
 * Centralized route wrapper that applies consistent wrapping logic
 * Eliminates the need to repeat SuspenseBoundary and PrivateRoute everywhere
 */
export function RouteWrapper({ config, children }: RouteWrapperProps) {
  let wrappedComponent = children

  // Wrap with SuspenseBoundary for lazy loading
  wrappedComponent = <SuspenseBoundary>{wrappedComponent}</SuspenseBoundary>

  // Wrap with PrivateRoute if the route requires authentication
  if (config.isProtected) {
    wrappedComponent = <PrivateRoute>{wrappedComponent}</PrivateRoute>
  }

  return wrappedComponent
}

/**
 * Higher-order function to create route elements with consistent wrapping
 */
export function createRouteElement(config: RouteConfig, Component: React.LazyExoticComponent<any>) {
  // Add error boundary around each route component
  const ErrorFallback = ({ error }: { error: Error }) => (
    <div className="flex items-center justify-center p-8">
      <div className="text-center">
        <h3 className="text-lg font-medium text-red-600 dark:text-red-400">
          Route Error
        </h3>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Failed to load "{config.label}" page.
        </p>
        <p className="mt-1 text-xs text-gray-400">
          {error.message}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Reload Page
        </button>
      </div>
    </div>
  )

  const SafeComponent = () => {
    try {
      return <Component />
    } catch (error) {
      console.error(`Error rendering component for route ${config.path}:`, error)
      return <ErrorFallback error={error as Error} />
    }
  }

  return (
    <RouteWrapper config={config}>
      <SafeComponent />
    </RouteWrapper>
  )
}

/**
 * Helper for simple component routes without protection
 */
export function createSimpleRoute(Component: React.LazyExoticComponent<any>) {
  return (
    <SuspenseBoundary>
      <Component />
    </SuspenseBoundary>
  )
}