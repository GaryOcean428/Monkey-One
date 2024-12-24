import { useEffect, lazy, Suspense } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ErrorBoundary } from './components/ErrorBoundary';
import { TooltipProvider } from './components/ui/tooltip';
import { useSettings } from './context/SettingsContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginForm } from './components/Auth/LoginForm';

// Lazy load heavy components
const MainPanel = lazy(() => import('./components/MainPanel'));
const ObserverPanel = lazy(() => import('./components/ObserverPanel'));

// Loading fallback
const LoadingFallback = () => (
  <div className="flex items-center justify-center h-full">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
  </div>
);

function AuthenticatedContent() {
  const { settings } = useSettings();
  const { user } = useAuth();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', settings.theme === 'dark');
  }, [settings.theme]);

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="w-full max-w-md p-8">
          <LoginForm />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 flex flex-col">
        <Header />
        <ErrorBoundary>
          <Suspense fallback={<LoadingFallback />}>
            <MainPanel />
          </Suspense>
        </ErrorBoundary>
      </main>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <TooltipProvider>
          <Suspense fallback={<LoadingFallback />}>
            <AuthenticatedContent />
          </Suspense>
        </TooltipProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;