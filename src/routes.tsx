import { createBrowserRouter } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { LoadingFallback } from './components/LoadingFallback';
import { DashboardLayout } from './components/Layout/DashboardLayout';
import { ToolhouseProvider } from './providers/ToolhouseProvider';

// Lazy-loaded components
const DashboardHome = lazy(() => import('./pages/Dashboard/DashboardHome').then(module => ({ default: module.DashboardHome })));
const MemoryManager = lazy(() => import('./components/Memory/MemoryManager').then(module => ({ default: module.MemoryManager })));
const Settings = lazy(() => import('./components/Settings').then(module => ({ default: module.Settings })));
const ProfileManager = lazy(() => import('./components/Profile/ProfileManager').then(module => ({ default: module.ProfileManager })));

const withSuspense = (Component: React.ComponentType) => (
  <Suspense fallback={<LoadingFallback />}>
    <Component />
  </Suspense>
);

const withProviders = (element: React.ReactNode) => (
  <ToolhouseProvider>
    <DashboardLayout>
      {element}
    </DashboardLayout>
  </ToolhouseProvider>
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: withProviders(withSuspense(DashboardHome)),
  },
  {
    path: '/memory',
    element: withProviders(withSuspense(MemoryManager)),
  },
  {
    path: '/profile',
    element: withProviders(withSuspense(ProfileManager)),
  },
  {
    path: '/settings',
    element: withProviders(withSuspense(Settings)),
  },
  {
    path: '*',
    element: withProviders(
      <div className="flex items-center justify-center h-[80vh]">
        <div className="text-center">
          <h1 className="text-4xl font-bold">404</h1>
          <p className="text-muted-foreground mt-2">Page not found</p>
        </div>
      </div>
    ),
  },
], {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true
  }
});
