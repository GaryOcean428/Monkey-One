import * as React from 'react'
import { createBrowserRouter, Navigate } from 'react-router'
import { RouterProvider } from 'react-router/dom'
import { SuspenseBoundary } from '@/components/ui/suspense-boundary'
import { ErrorBoundary } from '@/components/error-boundary'
import { App } from './App'
import { PrivateRoute } from './components/Auth/PrivateRoute'
import { ProviderRegistry } from './providers/provider-registry'

// Lazy load route components with explicit chunk names for better code splitting
// Use dynamic imports with Vite syntax for better tree-shaking and code-splitting
const Dashboard = React.lazy(() =>
  import('./pages/Dashboard').then(module => ({
    default: module.default || module.Dashboard || module,
  }))
)
const Chat = React.lazy(() =>
  import('./pages/Chat').then(module => ({
    default: module.default || module.Chat || module,
  }))
)
const Agents = React.lazy(() =>
  import('./pages/Agents').then(module => ({
    default: module.default || module.Agents || module,
  }))
)
const Workflow = React.lazy(() =>
  import('./pages/Workflow').then(module => ({
    default: module.default || module.Workflow || module,
  }))
)
const Tools = React.lazy(() =>
  import('./pages/Tools').then(module => ({
    default: module.default || module.Tools || module,
  }))
)
const Documents = React.lazy(() =>
  import('./pages/Documents').then(module => ({
    default: module.default || module.Documents || module,
  }))
)
const Analytics = React.lazy(() =>
  import('./pages/Performance').then(module => ({
    default: module.default || module.Performance || module,
  }))
)
const Settings = React.lazy(() =>
  import('./pages/Settings').then(module => ({
    default: module.default || module.Settings || module,
  }))
)

// Auth pages in a separate chunk
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
const AuthCallback = React.lazy(() =>
  import('./pages/Auth/AuthCallback').then(module => ({
    default: module.default || module.AuthCallback || module,
  }))
)
const PasswordReset = React.lazy(() =>
  import('./pages/Auth/PasswordReset').then(module => ({
    default: module.default || module.PasswordReset || module,
  }))
)

// Feature pages in another chunk
const AI = React.lazy(() =>
  import('./pages/AI').then(module => ({
    default: module.default || module.AI || module,
  }))
)
const Notes = React.lazy(() =>
  import('./pages/Notes').then(module => ({
    default: module.default || module.Notes || module,
  }))
)
const UIShowcase = React.lazy(() =>
  import('./pages/UIShowcase').then(module => ({
    default: module.default || module.UIShowcase || module,
  }))
)

// Component panels - should be lazy loaded
const ChatContainer = React.lazy(() =>
  import('./components/chat/ChatContainer').then(module => ({
    default: module.default || module.ChatContainer || module,
  }))
)
const AgentsPanel = React.lazy(() =>
  import('./components/agents/AgentsPanel').then(module => ({
    default: module.default || module.AgentsPanel || module,
  }))
)
const WorkflowPanel = React.lazy(() =>
  import('./components/workflow/WorkflowPanel').then(module => ({
    default: module.default || module.WorkflowPanel || module,
  }))
)
const ToolsPanel = React.lazy(() =>
  import('./components/tools/ToolsPanel').then(module => ({
    default: module.default || module.ToolsPanel || module,
  }))
)
const GithubPanel = React.lazy(() =>
  import('./pages/Github').then(module => ({
    default: module.default || module.GithubPanel || module,
  }))
)

// This component is not used but kept for future reference.
// Using underscore prefix to avoid ESLint unused variable warning
interface _ErrorFallbackProps {
  error?: Error
  children: React.ReactElement
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
          path: 'ui-showcase',
          element: (
            <SuspenseBoundary>
              <UIShowcase />
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
          path: 'notes',
          element: (
            <SuspenseBoundary>
              <Notes />
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
    <ProviderRegistry>
      <RouterProvider router={router} />
    </ProviderRegistry>
  )
}

export { router }
