import './styles/globals.css';
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
import { useAgentStore } from './store/agentStore';
import { LLMManager } from './lib/llm/providers';
import { DashboardPanel } from './components/panels/DashboardPanel';
import { AgentsPanel } from './components/panels/AgentsPanel';
import { WorkflowPanel } from './components/panels/WorkflowPanel';
import { MemoryPanel } from './components/panels/MemoryPanel';
import { DocumentsPanel } from './components/panels/DocumentsPanel';
import { ToolsPanel } from './components/panels/ToolsPanel';
import { SearchPanel } from './components/panels/SearchPanel';
import { VectorStorePanel } from './components/panels/VectorStorePanel';
import { SettingsPanel } from './components/panels/SettingsPanel';
import { PerformancePanel } from './components/panels/PerformancePanel';
import { AuthProvider } from './components/auth/AuthProvider';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

const providerRegistry = ProviderRegistry.getInstance();

export const App: React.FC = () => {
  const { user, isLoading } = useAuth();
  const setActiveAgent = useAgentStore(state => state.setActiveAgent);
  const llmManager = React.useMemo(() => new LLMManager(), []);

  // Initialize services
  React.useEffect(() => {
    const initializeServices = async () => {
      try {
        // Initialize local provider if not already registered
        if (!llmManager.getActiveProvider()) {
          const localProvider = new LocalProvider();
          await localProvider.initialize();
          llmManager.registerProvider('local', localProvider);
          llmManager.setActiveProvider('local');
        }

        setActiveAgent({
          id: 'default-agent',
          name: 'Local Agent',
          description: 'Default local agent using Ollama',
          provider: 'local',
          capabilities: ['chat', 'rag'],
          settings: {}
        });

        toast({
          title: 'Success',
          description: 'Local provider and agent initialized successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } catch (error) {
        console.error('Error initializing services:', error);
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to initialize services',
          variant: 'destructive',
        });
      }
    };

    initializeServices();
  }, [setActiveAgent, llmManager]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <TooltipProvider>
            <SettingsProvider>
              <ErrorBoundary>
                <Routes>
                  {/* Public routes */}
                  <Route path="/login" element={
                    <ProtectedRoute requireAuth={false}>
                      <LoginPage />
                    </ProtectedRoute>
                  } />

                  {/* Protected routes */}
                  <Route path="/" element={
                    <ProtectedRoute>
                      <DashboardLayout />
                    </ProtectedRoute>
                  }>
                    <Route index element={<Navigate to="/dashboard" />} />
                    <Route path="dashboard" element={<DashboardPanel />} />
                    <Route path="chat" element={<ChatContainer />} />
                    <Route path="agents" element={<AgentsPanel />} />
                    <Route path="workflows" element={<WorkflowPanel />} />
                    <Route path="memory" element={<MemoryPanel />} />
                    <Route path="documents" element={<DocumentsPanel />} />
                    <Route path="tools" element={<ToolsPanel />} />
                    <Route path="search" element={<SearchPanel />} />
                    <Route path="vector-store" element={<VectorStorePanel />} />
                    <Route path="github" element={<div>GitHub</div>} />
                    <Route path="performance" element={<PerformancePanel />} />
                    <Route path="settings" element={<SettingsPanel />} />
                  </Route>
                </Routes>
                <ModelManager />
                <Toaster />
              </ErrorBoundary>
            </SettingsProvider>
          </TooltipProvider>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
};