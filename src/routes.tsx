import React from 'react'
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import { App } from './App'
import { Dashboard } from './components/Dashboard'
import { AuthCallback } from './components/Auth/AuthCallback'
import { PasswordReset } from './components/Auth/PasswordReset'
import { MemoryManager } from './components/memory/MemoryManager'
import { ProfileManager } from './components/profile/ProfileManager'
import { PrivateRoute } from './components/Auth/PrivateRoute'
import { ChatContainer } from './components/chat/ChatContainer'
import { AgentsPanel } from './components/agents/AgentsPanel'
import { WorkflowPanel } from './components/workflow/WorkflowPanel'
import { ToolsPanel } from './components/tools/ToolsPanel'
import { DocumentsPanel } from './pages/Documents'
import { GithubPanel } from './pages/Github'
import { PerformancePanel } from './pages/Performance'
import { Settings } from './pages/Settings'
import { Login } from './components/Auth/Login'
import { Register } from './components/Auth/Register'

interface ErrorFallbackProps {
  error?: Error
  children: React.ReactElement
}

const ErrorFallback = ({ error, children }: ErrorFallbackProps) => {
  if (error) {
    return (
      <div className="error-boundary">
        <h2>Something went wrong:</h2>
        <pre>{error.message}</pre>
      </div>
    )
  }
  return children
}

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <ErrorFallback>
        <App />
      </ErrorFallback>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: (
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        ),
      },
      {
        path: 'auth',
        children: [
          {
            path: 'callback',
            element: <AuthCallback />,
          },
          {
            path: 'reset-password',
            element: <PasswordReset />,
          },
        ],
      },
      {
        path: 'memory',
        element: (
          <PrivateRoute>
            <MemoryManager />
          </PrivateRoute>
        ),
      },
      {
        path: 'profile',
        element: (
          <PrivateRoute>
            <ProfileManager />
          </PrivateRoute>
        ),
      },
      {
        path: 'chat',
        element: (
          <PrivateRoute>
            <ChatContainer />
          </PrivateRoute>
        ),
      },
      {
        path: 'agents',
        element: (
          <PrivateRoute>
            <AgentsPanel />
          </PrivateRoute>
        ),
      },
      {
        path: 'workflow',
        element: (
          <PrivateRoute>
            <WorkflowPanel />
          </PrivateRoute>
        ),
      },
      {
        path: 'tools',
        element: (
          <PrivateRoute>
            <ToolsPanel />
          </PrivateRoute>
        ),
      },
      {
        path: 'documents',
        element: (
          <PrivateRoute>
            <DocumentsPanel />
          </PrivateRoute>
        ),
      },
      {
        path: 'github',
        element: (
          <PrivateRoute>
            <GithubPanel />
          </PrivateRoute>
        ),
      },
      {
        path: 'performance',
        element: (
          <PrivateRoute>
            <PerformancePanel />
          </PrivateRoute>
        ),
      },
      {
        path: 'settings',
        element: (
          <PrivateRoute>
            <Settings />
          </PrivateRoute>
        ),
      },
    ],
  },
  {
    path: 'login',
    element: <Login />,
  },
  {
    path: 'register',
    element: <Register />,
  },
])

export function AppRoutes() {
  return <RouterProvider router={router} />
}

export { router }
