import './styles/globals.css';
import { useEffect, lazy, Suspense, useState } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { TooltipProvider } from './components/ui/tooltip';
import { SettingsProvider, useSettings } from './context/SettingsContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginForm } from './components/Auth/LoginForm';
import { SignUpForm } from './components/Auth/SignUpForm';
import { useAgentStore } from './store/agentStore';
import { DashboardLayout } from './components/Layout/DashboardLayout';
import { TabsContent } from './components/ui/tabs';
import { ThemeProvider } from './components/ThemeProvider';
import { LocalModelService } from './lib/llm/LocalModelService';
import { ModelManager } from './components/ModelManager';
import { Routes, Route } from 'react-router-dom';
import { ChatPanel } from './components/panels/ChatPanel';
import { AgentDashboard } from './components/panels/AgentDashboard';
import { WorkflowPanel } from './components/panels/WorkflowPanel';
import { MemoryPanel } from './components/panels/MemoryPanel';
import { DocumentsPanel } from './components/panels/DocumentsPanel';
import { DashboardPanel } from './components/panels/DashboardPanel';
import { ToolsPanel } from './components/panels/ToolsPanel';
import { SearchPanel } from './components/panels/SearchPanel';
import { VectorStorePanel } from './components/panels/VectorStorePanel';
import { GitHubPanel } from './components/panels/GitHubPanel';
import { PerformancePanel } from './components/panels/PerformancePanel';
import { Toaster } from './components/ui/toaster';
import { useToast } from './components/ui/use-toast';
import { logger } from './utils/logger';

const localModelService = new LocalModelService();

function AuthenticatedContent() {
  const { settings } = useSettings();
  const { user, isLoading } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const initializeAgents = useAgentStore(state => state.initializeAgents);
  const [modelInitialized, setModelInitialized] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const initModel = async () => {
      try {
        await localModelService.initialize();
        setModelInitialized(true);
        logger.info('Model initialized successfully');
      } catch (error) {
        logger.error('Failed to initialize model:', error);
        toast({
          title: 'Model Initialization Failed',
          description: 'There was an error initializing the model. Please try again.',
          variant: 'destructive',
        });
      }
    };

    initModel();
  }, [toast]);

  useEffect(() => {
    if (user && !isLoading && modelInitialized) {
      initializeAgents();
    }
  }, [user, isLoading, modelInitialized, initializeAgents]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', settings.theme === 'dark');
  }, [settings.theme]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        {isSignUp ? (
          <SignUpForm onSwitch={() => setIsSignUp(false)} />
        ) : (
          <LoginForm onSwitch={() => setIsSignUp(true)} />
        )}
      </div>
    );
  }

  if (!modelInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <ModelManager />
      </div>
    );
  }

  return (
    <DashboardLayout>
      <Routes>
        <Route path="/" element={<ChatPanel />} />
        <Route path="/agents" element={<AgentDashboard />} />
        <Route path="/workflow" element={<WorkflowPanel />} />
        <Route path="/memory" element={<MemoryPanel />} />
        <Route path="/documents" element={<DocumentsPanel />} />
        <Route path="/dashboard" element={<DashboardPanel />} />
        <Route path="/tools" element={<ToolsPanel />} />
        <Route path="/search" element={<SearchPanel />} />
        <Route path="/vectorstore" element={<VectorStorePanel />} />
        <Route path="/github" element={<GitHubPanel />} />
        <Route path="/performance" element={<PerformancePanel />} />
      </Routes>
    </DashboardLayout>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <TooltipProvider>
          <SettingsProvider>
            <AuthProvider>
              <AuthenticatedContent />
            </AuthProvider>
          </SettingsProvider>
        </TooltipProvider>
      </ThemeProvider>
      <Toaster />
    </ErrorBoundary>
  );
}

export default App;