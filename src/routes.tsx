import { createBrowserRouter, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { LoadingFallback } from './components/LoadingFallback';
import { ToolhouseProvider } from './providers/ToolhouseProvider';
import App from './App';

// Lazy-loaded components
const DashboardHome = lazy(() => import('./pages/Dashboard/DashboardHome').then(module => ({ default: module.DashboardHome })));
const MemoryManager = lazy(() => import('./components/Memory/MemoryManager').then(module => ({ default: module.MemoryManager })));
const Settings = lazy(() => import('./components/Settings').then(module => ({ default: module.Settings })));
const ProfileManager = lazy(() => import('./components/Profile/ProfileManager').then(module => ({ default: module.ProfileManager })));
const AgentsPanel = lazy(() => import('./components/panels/AgentsPanel'));
const WorkflowPanel = lazy(() => import('./components/panels/WorkflowPanel'));
const DocumentsPanel = lazy(() => import('./components/panels/DocumentsPanel'));
const ToolsPanel = lazy(() => import('./components/panels/ToolsPanel'));
const GitHubPanel = lazy(() => import('./components/panels/GitHubPanel'));
const PerformancePanel = lazy(() => import('./components/panels/PerformancePanel'));
const ChatPanel = lazy(() => import('./components/chat/ChatContainer').then(module => ({ default: module.ChatContainer })));

const withSuspense = (Component: React.ComponentType) => (
  <Suspense fallback={<LoadingFallback />}>
    <Component />
  </Suspense>
);

const withProviders = (element: React.ReactNode) => (
  <ToolhouseProvider>
    {element}
  </ToolhouseProvider>
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: withProviders(withSuspense(ChatPanel)),
      },
      {
        path: 'agents',
        element: withProviders(withSuspense(AgentsPanel)),
      },
      {
        path: 'workflow',
        element: withProviders(withSuspense(WorkflowPanel)),
      },
      {
        path: 'memory',
        element: withProviders(withSuspense(MemoryManager)),
      },
      {
        path: 'documents',
        element: withProviders(withSuspense(DocumentsPanel)),
      },
      {
        path: 'tools',
        element: withProviders(withSuspense(ToolsPanel)),
      },
      {
        path: 'github',
        element: withProviders(withSuspense(GithubPanel)),
      },
      {
        path: 'performance',
        element: withProviders(withSuspense(PerformancePanel)),
      },
      {
        path: 'settings',
        element: withProviders(withSuspense(Settings)),
      },
      {
        path: 'profile',
        element: withProviders(withSuspense(ProfileManager)),
      },
      {
        path: '*',
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);
