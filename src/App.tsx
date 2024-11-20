import { useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { MainPanel } from './components/MainPanel';
import { SettingsProvider } from './context/SettingsContext';
import { AgentProvider } from './context/AgentContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { TooltipProvider } from './components/ui/tooltip';
import { useSettings } from './context/SettingsContext';

function AppContent() {
  const { settings } = useSettings();

  useEffect(() => {
    // Apply theme class to root html element
    document.documentElement.classList.toggle('dark', settings.theme === 'dark');
  }, [settings.theme]);

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 flex flex-col">
        <Header />
        <MainPanel />
      </main>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <SettingsProvider>
        <AgentProvider>
          <TooltipProvider>
            <AppContent />
          </TooltipProvider>
        </AgentProvider>
      </SettingsProvider>
    </ErrorBoundary>
  );
}

export default App;