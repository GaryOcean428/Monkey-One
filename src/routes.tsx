import { SimpleErrorBoundary } from '@/components/simple-error-boundary'
import { routeConfigs } from '@/config/routes'
import { getComponentByName } from '@/utils/component-registry'
import { createRouteElement, createSimpleRoute } from '@/utils/route-wrapper'
import * as React from 'react'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import { App } from './App'
import { ProviderRegistry } from './providers/provider-registry'

// Auth pages (outside main app layout)
const Login = React.lazy(async () => {
  const module = await import('./pages/Login')
  const resolved = (module as any).default ?? (module as any).Login ?? module
  return { default: resolved }
})
const Register = React.lazy(async () => {
  const module = await import('./pages/Register')
  const resolved = (module as any).default ?? (module as any).Register ?? module
  return { default: resolved }
})
const AuthCallback = React.lazy(async () => {
  const module = await import('./pages/AuthCallback')
  const resolved = (module as any).default ?? (module as any).AuthCallback ?? module
  return { default: resolved }
})

// Generate routes dynamically from configuration
function generateRoutes() {
  return routeConfigs.map(config => {
    const Component = getComponentByName(config.component)
    return {
      path: config.path === '/dashboard' ? 'dashboard' : config.path.substring(1), // Remove leading slash except for dashboard
      element: createRouteElement(config, Component),
    }
  })
}

const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <App />,
      errorElement: <SimpleErrorBoundary>{null}</SimpleErrorBoundary>,
      children: [
        {
          index: true,
          element: <Navigate to="/dashboard" replace />,
        },
        // Generate all routes dynamically from configuration
        ...generateRoutes(),
      ],
    },
    {
      path: 'login',
      element: createSimpleRoute(Login),
    },
    {
      path: 'register',
      element: createSimpleRoute(Register),
    },
    {
      path: 'auth/callback',
      element: createSimpleRoute(AuthCallback),
    },
  ],
  {}
)

export function AppRoutes() {
  return (
    <SimpleErrorBoundary
      fallback={
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h2>Something went wrong</h2>
          <button onClick={() => window.location.reload()}>Reload Page</button>
        </div>
      }
    >
      <ProviderRegistry>
        <RouterProvider router={router} />
      </ProviderRegistry>
    </SimpleErrorBoundary>
  )
}

export { router }
