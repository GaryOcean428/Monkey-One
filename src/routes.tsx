import { createBrowserRouter } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { LoadingFallback } from './components/LoadingFallback';
import { ProfileManager } from './components/Profile/ProfileManager';

const MainPanel = lazy(() => import('./components/MainPanel').then(module => ({ default: module.MainPanel })));
const Settings = lazy(() => import('./components/Settings').then(module => ({ default: module.Settings })));

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <MainPanel />
      </Suspense>
    ),
  },
  {
    path: '/profile',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <ProfileManager />
      </Suspense>
    ),
  },
  {
    path: '/settings',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <Settings />
      </Suspense>
    ),
  },
]);
