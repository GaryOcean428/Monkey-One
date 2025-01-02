import React from 'react'
import { createBrowserRouter } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { LoadingFallback } from './components/LoadingFallback'
import { ToolhouseProvider } from './providers/ToolhouseProvider'
import App from './App'

// Lazy-loaded components
const DashboardHome = lazy(() =>
  import('./pages/Dashboard/DashboardHome').then(m => ({ default: m.DashboardHome }))
)
const MemoryManager = lazy(() =>
  import('./components/Memory/MemoryManager').then(m => ({ default: m.MemoryManager }))
)
const Settings = lazy(() => import('./components/Settings').then(m => ({ default: m.Settings })))
const ProfileManager = lazy(() =>
  import('./components/Profile/ProfileManager').then(m => ({ default: m.ProfileManager }))
)
const AgentsPanel = lazy(() => import('./components/panels/AgentsPanel'))
const WorkflowPanel = lazy(() =>
  import('./components/panels/WorkflowPanel').then(m => ({ default: m.WorkflowPanel }))
)
const DocumentsPanel = lazy(() =>
  import('./components/panels/DocumentsPanel').then(m => ({ default: m.DocumentsPanel }))
)
const ToolsPanel = lazy(() =>
  import('./components/panels/ToolsPanel').then(m => ({ default: m.ToolsPanel }))
)
const GithubPanel = lazy(() => import('./components/panels/GitHubPanel'))
const PerformancePanel = lazy(() =>
  import('./components/panels/PerformancePanel').then(m => ({ default: m.PerformancePanel }))
)
const ChatPanel = lazy(() =>
  import('./components/chat/ChatContainer').then(m => ({ default: m.ChatContainer }))
)

// Auth components
const AuthCallback = lazy(() =>
  import('./components/Auth/AuthCallback').then(m => ({ default: m.AuthCallback }))
)
const PasswordReset = lazy(() =>
  import('./components/Auth/PasswordReset').then(m => ({ default: m.PasswordReset }))
)

// Future flags for React Router v7 compatibility
const routerOptions = {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true,
  },
}

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
          element: withProviders(<GithubPanel />),
        },
        {
          path: 'performance',
          element: withProviders(<PerformancePanel />),
        },
        {
          path: 'auth/callback',
          element: (
            <Suspense fallback={<LoadingFallback />}>
              <AuthCallback />
            </Suspense>
          ),
        },
        {
          path: 'auth/reset-password',
          element: (
            <Suspense fallback={<LoadingFallback />}>
              <PasswordReset />
            </Suspense>
          ),
        },
      ],
    },
  ],
  routerOptions
)
