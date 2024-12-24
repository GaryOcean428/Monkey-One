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

// Lazy-loaded components
const ChatPanel = lazy(() => import('./components/panels/ChatPanel').then(module => ({ default: module.ChatPanel })));
const AgentDashboard = lazy(() => import('./components/panels/AgentDashboard').then(module => ({ default: module.AgentDashboard })));
const WorkflowPanel = lazy(() => import('./components/panels/WorkflowPanel').then(module => ({ default: module.WorkflowPanel })));
const MemoryPanel = lazy(() => import('./components/panels/MemoryPanel').then(module => ({ default: module.MemoryPanel })));
const DocumentsPanel = lazy(() => import('./components/panels/DocumentsPanel').then(module => ({ default: module.DocumentsPanel })));
const DashboardPanel = lazy(() => import('./components/panels/DashboardPanel').then(module => ({ default: module.DashboardPanel })));
const ToolsPanel = lazy(() => import('./components/panels/ToolsPanel').then(module => ({ default: module.ToolsPanel })));
const SearchPanel = lazy(() => import('./components/panels/SearchPanel').then(module => ({ default: module.SearchPanel })));
const VectorStorePanel = lazy(() => import('./components/panels/VectorStorePanel').then(module => ({ default: module.VectorStorePanel })));
const GitHubPanel = lazy(() => import('./components/panels/GitHubPanel').then(module => ({ default: module.GitHubPanel })));
const PerformancePanel = lazy(() => import('./components/panels/PerformancePanel').then(module => ({ default: module.PerformancePanel })));

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
  const { activeTab } = useNavigationStore();

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
    <DashboardLayout>
      <TabsContent value={activeTab} className="h-full m-0 p-0 overflow-hidden">
        <Suspense fallback={<LoadingFallback />}>
          {activeTab === 'chat' && <ChatPanel />}
          {activeTab === 'agents' && <AgentDashboard />}
          {activeTab === 'workflows' && <WorkflowPanel />}
          {activeTab === 'memory' && <MemoryPanel />}
          {activeTab === 'documents' && <DocumentsPanel />}
          {activeTab === 'dashboard' && <DashboardPanel />}
          {activeTab === 'tools' && <ToolsPanel />}
          {activeTab === 'search' && <SearchPanel />}
          {activeTab === 'vectorstore' && <VectorStorePanel />}
          {activeTab === 'github' && <GitHubPanel />}
          {activeTab === 'performance' && <PerformancePanel />}
        </Suspense>
      </TabsContent>
    </DashboardLayout>
  );
}

function App() {
  return (
    <ThemeProvider>
      <TooltipProvider>
        <ErrorBoundary>
          <SettingsProvider>
            <AuthProvider>
              <Suspense fallback={<LoadingFallback />}>
                <AuthenticatedContent />
              </Suspense>
            </AuthProvider>
          </SettingsProvider>
        </ErrorBoundary>
      </TooltipProvider>
    </ThemeProvider>
  );
}

export default App;