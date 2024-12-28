import './styles/globals.css';
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { LoginPage } from './components/auth/LoginPage';
import { DashboardLayout } from './components/Layout/DashboardLayout';
import { ChatContainer } from './components/chat/ChatContainer';
import { LoadingSpinner } from './components/ui/loading-spinner';
import { Toaster } from './components/ui/toaster';
import { ThemeProvider } from './components/ThemeProvider';
import { TooltipProvider } from '@radix-ui/react-tooltip';
import { ErrorBoundary } from './components/ErrorBoundary';
import { SettingsProvider } from './contexts/SettingsContext';
import { ProviderRegistry } from './lib/providers';
import { LocalProvider } from './lib/llm/providers/local';
import { ModelManager } from './components/ModelManager';
import { toast } from './components/ui/use-toast';

const providerRegistry = ProviderRegistry.getInstance();

export const App: React.FC = () => {
  const { user, isLoading } = useAuth();

  // Initialize services
  React.useEffect(() => {
    const initializeServices = async () => {
      try {
        const localProvider = new LocalProvider();
        await providerRegistry.registerProvider('local', localProvider);
        toast({
          title: 'Success',
          description: 'Local provider registered successfully',
        });
      } catch (error) {
        console.error('Failed to initialize services:', error);
        toast({
          title: 'Error',
          description: 'Failed to initialize services',
          variant: 'destructive',
        });
      }
    };

    initializeServices();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <ThemeProvider>
      <TooltipProvider>
        <SettingsProvider>
          <ErrorBoundary>
            <Routes>
              <Route 
                path="/login" 
                element={user ? <Navigate to="/dashboard" /> : <LoginPage />} 
              />
              
              <Route
                path="/"
                element={user ? <DashboardLayout /> : <Navigate to="/login" />}
              >
                <Route index element={<Navigate to="/dashboard" />} />
                <Route path="dashboard" element={<div>Dashboard</div>} />
                <Route path="chat" element={<ChatContainer />} />
                <Route path="agents" element={<div>Agents</div>} />
                <Route path="workflows" element={<div>Workflows</div>} />
                <Route path="memory" element={<div>Memory</div>} />
                <Route path="documents" element={<div>Documents</div>} />
                <Route path="tools" element={<div>Tools</div>} />
                <Route path="search" element={<div>Search</div>} />
                <Route path="vector-store" element={<div>Vector Store</div>} />
                <Route path="github" element={<div>GitHub</div>} />
                <Route path="performance" element={<div>Performance</div>} />
                <Route path="settings" element={<div>Settings</div>} />
              </Route>
            </Routes>
            <ModelManager />
            <Toaster />
          </ErrorBoundary>
        </SettingsProvider>
      </TooltipProvider>
    </ThemeProvider>
  );
};