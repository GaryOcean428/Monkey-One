import './styles/globals.css';
import { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth, AuthProvider } from './contexts/AuthContext';
import { SignIn } from './components/Auth/SignIn';
import { SignUpForm as SignUp } from './components/Auth/SignUpForm';
import { ChatContainer as Chat } from './components/chat/ChatContainer';
import SettingsPanel from './components/panels/SettingsPanel';
import { MainPanel as Playground } from './components/MainPanel';
import { useAgentStore } from './store/agentStore';
import { DashboardLayout } from './components/Layout/DashboardLayout';
import { ThemeProvider } from './components/ThemeProvider';
import { ProviderRegistry } from './lib/providers';
import { LocalProvider } from './lib/llm/providers/local';
import { ModelManager } from './components/ModelManager';
import { Toaster } from './components/ui/toaster';
import { useToast } from './components/ui/use-toast';
import { logger } from './utils/logger';
import { ErrorBoundary } from './components/ErrorBoundary';
import { TooltipProvider } from './components/ui/tooltip';
import { SettingsProvider } from './contexts/SettingsContext';

const providerRegistry = ProviderRegistry.getInstance();

/**
 * Main application component that handles routing and service initialization
 * Provides authentication, theme, and settings context to the application
 */
function App() {
  const { user, isLoading } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const initializeAgents = useAgentStore(state => state.initializeAgents);
  const [modelInitialized, setModelInitialized] = useState(false);
  const { toast } = useToast();

  /**
   * Initialize model service and provider registry
   * Handles errors gracefully with user feedback
   */
  useEffect(() => {
    const initializeServices = async () => {
      try {
        const localProvider = new LocalProvider();
        await providerRegistry.registerProvider('local', localProvider);
        setModelInitialized(true);
        logger.info('Model service initialized successfully');
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        logger.error('Failed to initialize model service:', errorMessage);
        toast({
          title: 'Service Initialization Error',
          description: 'Failed to initialize model service. Some features may be unavailable. Please try refreshing the page.',
          variant: 'destructive',
          duration: 5000
        });
      }
    };

    initializeServices();
  }, [toast]);

  useEffect(() => {
    if (user && !isLoading && modelInitialized) {
      initializeAgents();
    }
  }, [user, isLoading, modelInitialized, initializeAgents]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <TooltipProvider>
          <SettingsProvider>
            <AuthProvider>
              <div className="min-h-screen">
                {!user ? (
                  <div className="flex min-h-screen items-center justify-center">
                    {isSignUp ? (
                      <SignUp onSwitch={() => setIsSignUp(false)} />
                    ) : (
                      <SignIn onSwitch={() => setIsSignUp(true)} />
                    )}
                  </div>
                ) : (
                  <DashboardLayout>
                    <Routes>
                      <Route path="/" element={<Chat />} />
                      <Route path="/settings" element={<SettingsPanel />} />
                      <Route path="/playground" element={<Playground />} />
                    </Routes>
                  </DashboardLayout>
                )}
              </div>
              <ModelManager />
              <Toaster />
            </AuthProvider>
          </SettingsProvider>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;