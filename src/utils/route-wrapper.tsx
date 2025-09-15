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
  return (
    <RouteWrapper config={config}>
      <Component />
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