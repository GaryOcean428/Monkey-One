import { useEffect, lazy, Suspense, useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ErrorBoundary } from './components/ErrorBoundary';
import { TooltipProvider } from './components/ui/tooltip';
import { SettingsProvider, useSettings } from './context/SettingsContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginForm } from './components/Auth/LoginForm';
import { SignUpForm } from './components/Auth/SignUpForm';
import { useAgentStore } from './store/agentStore';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes';

// Loading fallback
const LoadingFallback = () => (
  <div className="flex items-center justify-center h-full">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
  </div>
);

function AuthenticatedContent() {
  const { settings } = useSettings();
  const { user } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const initializeAgents = useAgentStore(state => state.initializeAgents);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', settings.theme === 'dark');
  }, [settings.theme]);

  useEffect(() => {
    if (user) {
      initializeAgents().catch(console.error);
    }
  }, [user, initializeAgents]);

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="w-full max-w-md p-8">
          {isSignUp ? (
            <>
              <SignUpForm />
              <button
                onClick={() => setIsSignUp(false)}
                className="mt-4 w-full text-center text-sm text-gray-600 hover:text-gray-900"
              >
                Already have an account? Sign in
              </button>
            </>
          ) : (
            <>
              <LoginForm />
              <button
                onClick={() => setIsSignUp(true)}
                className="mt-4 w-full text-center text-sm text-gray-600 hover:text-gray-900"
              >
                Don't have an account? Sign up
              </button>
            </>
          )}
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
          <RouterProvider router={router} />
        </ErrorBoundary>
      </main>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <SettingsProvider>
        <AuthProvider>
          <TooltipProvider>
            <Suspense fallback={<LoadingFallback />}>
              <AuthenticatedContent />
            </Suspense>
          </TooltipProvider>
        </AuthProvider>
      </SettingsProvider>
    </ErrorBoundary>
  );
}

export default App;