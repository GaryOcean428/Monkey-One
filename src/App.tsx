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
import { useNavigationStore } from './store/navigationStore';
import { ThemeProvider } from './components/ThemeProvider';
import { LocalModelService } from './lib/llm/LocalModelService';
import { ModelManager } from './components/ModelManager';

// Lazy-loaded components
const ChatPanel = lazy(() => import('./components/panels/ChatPanel'));
const AgentDashboard = lazy(() => import('./components/panels/AgentDashboard'));
const WorkflowPanel = lazy(() => import('./components/panels/WorkflowPanel'));
const MemoryPanel = lazy(() => import('./components/panels/MemoryPanel'));
const DocumentsPanel = lazy(() => import('./components/panels/DocumentsPanel'));
const DashboardPanel = lazy(() => import('./components/panels/DashboardPanel'));
const ToolsPanel = lazy(() => import('./components/panels/ToolsPanel'));
const SearchPanel = lazy(() => import('./components/panels/SearchPanel'));
const VectorStorePanel = lazy(() => import('./components/panels/VectorStorePanel'));
const GitHubPanel = lazy(() => import('./components/panels/GitHubPanel'));
const PerformancePanel = lazy(() => import('./components/panels/PerformancePanel'));

// Loading fallback
const LoadingFallback = () => (
  <div className="flex items-center justify-center h-full">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
  </div>
);

function AuthenticatedContent() {
  const { settings } = useSettings();
  const { user, isLoading } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const initializeAgents = useAgentStore(state => state.initializeAgents);
  const { activeTab } = useNavigationStore();
  const [modelInitialized, setModelInitialized] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', settings.theme === 'dark');
  }, [settings.theme]);

  useEffect(() => {
    async function initializeModel() {
      try {
        const modelService = LocalModelService.getInstance();
        await modelService.initialize();
        setModelInitialized(true);
      } catch (error) {
        console.error('Failed to initialize model:', error);
      }
    }

    if (user) {
      initializeModel();
      initializeAgents().catch(console.error);
    }
  }, [user, initializeAgents]);

  if (isLoading) {
    return <LoadingFallback />;
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
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
      <div className="flex min-h-screen items-center justify-center bg-background">
        <ModelManager />
      </div>
    );
  }

  return (
    <DashboardLayout>
      <Suspense fallback={<LoadingFallback />}>
        <TabsContent value="chat" className="m-0">
          <ChatPanel />
        </TabsContent>
        <TabsContent value="agents" className="m-0">
          <AgentDashboard />
        </TabsContent>
        <TabsContent value="workflow" className="m-0">
          <WorkflowPanel />
        </TabsContent>
        <TabsContent value="memory" className="m-0">
          <MemoryPanel />
        </TabsContent>
        <TabsContent value="documents" className="m-0">
          <DocumentsPanel />
        </TabsContent>
        <TabsContent value="dashboard" className="m-0">
          <DashboardPanel />
        </TabsContent>
        <TabsContent value="tools" className="m-0">
          <ToolsPanel />
        </TabsContent>
        <TabsContent value="search" className="m-0">
          <SearchPanel />
        </TabsContent>
        <TabsContent value="vectorstore" className="m-0">
          <VectorStorePanel />
        </TabsContent>
        <TabsContent value="github" className="m-0">
          <GitHubPanel />
        </TabsContent>
        <TabsContent value="performance" className="m-0">
          <PerformancePanel />
        </TabsContent>
      </Suspense>
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
    </ErrorBoundary>
  );
}

export default App;