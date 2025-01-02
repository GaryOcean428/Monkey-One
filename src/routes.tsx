import React from 'react'
import { createBrowserRouter } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { LoadingFallback } from './components/LoadingFallback'
import { ToolhouseProvider } from './providers/ToolhouseProvider'
import { App } from './App'
import { PrivateRoute } from './components/auth/PrivateRoute'

// Lazy load components
const LoginPage = lazy(() =>
  import('./components/auth/LoginPage').then(m => ({ default: m.LoginPage }))
)
const ChatPanel = lazy(() =>
  import('./components/chat/ChatContainer').then(m => ({ default: m.ChatContainer }))
)
const DashboardHome = lazy(() =>
  import('./components/dashboard/DashboardHome').then(m => ({ default: m.DashboardHome }))
)
const MemoryManager = lazy(() =>
  import('./components/memory/MemoryManager').then(m => ({ default: m.MemoryManager }))
)
const Settings = lazy(() =>
  import('./components/settings/Settings').then(m => ({ default: m.Settings }))
)
const ProfileManager = lazy(() =>
  import('./components/profile/ProfileManager').then(m => ({ default: m.ProfileManager }))
)
const AgentsPanel = lazy(() =>
  import('./components/agents/AgentsPanel').then(m => ({ default: m.AgentsPanel }))
)
const WorkflowPanel = lazy(() =>
  import('./components/workflow/WorkflowPanel').then(m => ({ default: m.WorkflowPanel }))
)
const DocumentsPanel = lazy(() =>
  import('./components/documents/DocumentsPanel').then(m => ({ default: m.DocumentsPanel }))
)
const ToolsPanel = lazy(() =>
  import('./components/tools/ToolsPanel').then(m => ({ default: m.ToolsPanel }))
)
const GithubPanel = lazy(() =>
  import('./components/github/GithubPanel').then(m => ({ default: m.GithubPanel }))
)
const PerformancePanel = lazy(() =>
  import('./components/performance/PerformancePanel').then(m => ({ default: m.PerformancePanel }))
)
const AuthCallback = lazy(() => import('./components/auth/AuthCallback'))
const PasswordReset = lazy(() => import('./components/auth/PasswordReset'))

const routerOptions = {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true,
  },
}

const withProviders = (element: React.ReactNode) => (
  <PrivateRoute>
    <ToolhouseProvider>{element}</ToolhouseProvider>
  </PrivateRoute>
)

export const router = createBrowserRouter(
  [
    {
      path: '/login',
      element: (
        <Suspense fallback={<LoadingFallback />}>
          <LoginPage />
        </Suspense>
      ),
    },
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
