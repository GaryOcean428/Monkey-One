import * as React from 'react'
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import { SuspenseBoundary } from '@/components/ui/suspense-boundary'
import { ErrorBoundary } from '@/components/error-boundary'
import { App } from './App'
import { PrivateRoute } from './components/Auth/PrivateRoute'
import { ChatContainer } from './components/chat/ChatContainer'
import { AgentsPanel } from './components/agents/AgentsPanel'
import { WorkflowPanel } from './components/workflow/WorkflowPanel'
import { ToolsPanel } from './components/tools/ToolsPanel'
import { GithubPanel } from './pages/Github'

// Lazy load route components
const Dashboard = React.lazy(() => import('./pages/Dashboard'))
const Chat = React.lazy(() => import('./pages/Chat'))
const Agents = React.lazy(() => import('./pages/Agents'))
const Workflow = React.lazy(() => import('./pages/Workflow'))
const Tools = React.lazy(() => import('./pages/Tools'))
const Documents = React.lazy(() => import('./pages/Documents'))
const Analytics = React.lazy(() => import('./pages/Performance'))
const Settings = React.lazy(() => import('./pages/Settings'))
const Login = React.lazy(() => import('./pages/Login'))
const Register = React.lazy(() => import('./pages/Register'))
const AuthCallback = React.lazy(() => import('./pages/Auth/AuthCallback'))
const PasswordReset = React.lazy(() => import('./pages/Auth/PasswordReset'))
const AI = React.lazy(() => import('./pages/AI'))

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
    element: <App />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: (
          <SuspenseBoundary>
            <Dashboard />
          </SuspenseBoundary>
        ),
      },
      {
        path: 'chat',
        element: (
          <SuspenseBoundary>
            <Chat />
          </SuspenseBoundary>
        ),
      },
      {
        path: 'agents',
        element: (
          <SuspenseBoundary>
            <Agents />
          </SuspenseBoundary>
        ),
      },
      {
        path: 'workflow',
        element: (
          <SuspenseBoundary>
            <Workflow />
          </SuspenseBoundary>
        ),
      },
      {
        path: 'tools',
        element: (
          <SuspenseBoundary>
            <Tools />
          </SuspenseBoundary>
        ),
      },
      {
        path: 'documents',
        element: (
          <SuspenseBoundary>
            <Documents />
          </SuspenseBoundary>
        ),
      },
      {
        path: 'analytics',
        element: (
          <SuspenseBoundary>
            <Analytics />
          </SuspenseBoundary>
        ),
      },
      {
        path: 'settings',
        element: (
          <SuspenseBoundary>
            <Settings />
          </SuspenseBoundary>
        ),
      },
      {
        path: 'auth/callback',
        element: (
          <SuspenseBoundary>
            <AuthCallback />
          </SuspenseBoundary>
        ),
      },
      {
        path: 'reset-password',
        element: (
          <SuspenseBoundary>
            <PasswordReset />
          </SuspenseBoundary>
        ),
      },
      {
        path: 'github',
        element: (
          <SuspenseBoundary>
            <GithubPanel />
          </SuspenseBoundary>
        ),
      },
      {
        path: 'ai',
        element: (
          <SuspenseBoundary>
            <AI />
          </SuspenseBoundary>
        ),
      },
      {
        path: 'memory-manager',
        element: (
          <SuspenseBoundary>
            <PrivateRoute>
              {/* <MemoryManager /> */}
              <div>Memory Manager</div>
            </PrivateRoute>
          </SuspenseBoundary>
        ),
      },
      {
        path: 'profile-manager',
        element: (
          <SuspenseBoundary>
            <PrivateRoute>
              {/* <ProfileManager /> */}
              <div>Profile Manager</div>
            </PrivateRoute>
          </SuspenseBoundary>
        ),
      },
      {
        path: 'chat-container',
        element: (
          <SuspenseBoundary>
            <PrivateRoute>
              <ChatContainer />
            </PrivateRoute>
          </SuspenseBoundary>
        ),
      },
      {
        path: 'agents-panel',
        element: (
          <SuspenseBoundary>
            <PrivateRoute>
              <AgentsPanel />
            </PrivateRoute>
          </SuspenseBoundary>
        ),
      },
      {
        path: 'workflow-panel',
        element: (
          <SuspenseBoundary>
            <PrivateRoute>
              <WorkflowPanel />
            </PrivateRoute>
          </SuspenseBoundary>
        ),
      },
      {
        path: 'tools-panel',
        element: (
          <SuspenseBoundary>
            <PrivateRoute>
              <ToolsPanel />
            </PrivateRoute>
          </SuspenseBoundary>
        ),
      },
    ],
  },
  {
    path: 'login',
    element: (
      <SuspenseBoundary>
        <Login />
      </SuspenseBoundary>
    ),
  },
  {
    path: 'register',
    element: (
      <SuspenseBoundary>
        <Register />
      </SuspenseBoundary>
    ),
  },
])

export function AppRoutes() {
  return <RouterProvider router={router} />
}

export { router }
