import React from 'react'
import { createBrowserRouter } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { LoadingFallback } from './components/LoadingFallback'
import { ToolhouseProvider } from './providers/ToolhouseProvider'
import App from './App'

// Lazy-loaded components with proper default export handling
const DashboardHome = lazy(() => import('./pages/Dashboard/DashboardHome'))
const MemoryManager = lazy(() => import('./components/Memory/MemoryManager'))
const Settings = lazy(() => import('./components/Settings'))
const ProfileManager = lazy(() => import('./components/Profile/ProfileManager'))
const AgentsPanel = lazy(() => import('./components/panels/AgentsPanel'))
const WorkflowPanel = lazy(() => import('./components/panels/WorkflowPanel'))
const DocumentsPanel = lazy(() => import('./components/panels/DocumentsPanel'))
const ToolsPanel = lazy(() => import('./components/panels/ToolsPanel'))
const GitHubPanel = lazy(() => import('./components/panels/GitHubPanel'))
const PerformancePanel = lazy(() => import('./components/panels/PerformancePanel'))
const ChatPanel = lazy(() => import('./components/chat/ChatContainer'))

// Auth components
const AuthComponents = lazy(() => import('./routes/auth'))

const withProviders = (element: React.ReactNode) => (
  <ToolhouseProvider>
    <Suspense fallback={<LoadingFallback />}>{element}</Suspense>
  </ToolhouseProvider>
)

export const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <App />,
      children: [
        {
          index: true,
          element: withProviders(<ChatPanel />),
        },
        {
          path: 'chat',
          element: withProviders(<ChatPanel />),
        },
        {
          path: 'dashboard',
          element: withProviders(<DashboardHome />),
        },
        {
          path: 'memory',
          element: withProviders(<MemoryManager />),
        },
        {
          path: 'settings',
          element: withProviders(<Settings />),
        },
        {
          path: 'profile',
          element: withProviders(<ProfileManager />),
        },
        {
          path: 'agents',
          element: withProviders(<AgentsPanel />),
        },
        {
          path: 'workflow',
          element: withProviders(<WorkflowPanel />),
        },
        {
          path: 'documents',
          element: withProviders(<DocumentsPanel />),
        },
        {
          path: 'tools',
          element: withProviders(<ToolsPanel />),
        },
        {
          path: 'github',
          element: withProviders(<GitHubPanel />),
        },
        {
          path: 'performance',
          element: withProviders(<PerformancePanel />),
        },
        {
          path: 'auth/callback',
          element: (
            <Suspense fallback={<LoadingFallback />}>
              <AuthComponents.AuthCallback />
            </Suspense>
          ),
        },
        {
          path: 'auth/reset-password',
          element: (
            <Suspense fallback={<LoadingFallback />}>
              <AuthComponents.PasswordReset />
            </Suspense>
          ),
        },
      ],
    },
  ],
  {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true,
    },
  }
)
