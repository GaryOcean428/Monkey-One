import * as React from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { RouterProvider } from 'react-router-dom'
import { ErrorBoundary } from '@/components/error-boundary'
import { App } from './App'
import { ProviderRegistry } from './providers/provider-registry'
import { routeConfigs } from '@/config/routes'
import { getComponentByName } from '@/utils/component-registry'
import { createRouteElement, createSimpleRoute } from '@/utils/route-wrapper'

// Auth pages (outside main app layout)
const Login = React.lazy(() =>
  import('./pages/Login').then(module => ({
    default: module.default || module.Login || module,
  }))
)
const Register = React.lazy(() =>
  import('./pages/Register').then(module => ({
    default: module.default || module.Register || module,
  }))
)

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
      errorElement: <ErrorBoundary />,
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
  ],
  {
    future: {
      v7_relativeSplatPath: true,
      v7_startTransition: true,
    },
  }
)

export function AppRoutes() {
  return (
    <ErrorBoundary fallback={
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Something went wrong</h2>
        <button onClick={() => window.location.reload()}>Reload Page</button>
      </div>
    }>
      <ProviderRegistry>
        <RouterProvider router={router} />
      </ProviderRegistry>
    </ErrorBoundary>
  )
}

export { router }
