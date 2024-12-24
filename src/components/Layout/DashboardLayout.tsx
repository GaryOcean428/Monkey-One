import React from 'react';
import { cn } from '../../lib/utils';
import { NeonMonkey } from '../Logo/NeonMonkey';
import {
  MessageSquare,
  Settings,
  Code2,
  Database,
  Brain,
  GitBranch,
  Terminal,
  Workflow,
  Zap,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { ScrollArea } from '../ui/scroll-area';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import { Tabs, TabsContent } from '../ui/tabs';
import { useNavigationStore } from '../../store/navigationStore';
import { useTheme } from '../ThemeProvider';
import { ThoughtLoggerPanel } from '../panels/ThoughtLoggerPanel';
import { AgentMonitor } from '../panels/AgentMonitor';

const navItems = [
  { id: 'chat', label: 'Chat', icon: MessageSquare },
  { id: 'agents', label: 'Agents', icon: GitBranch },
  { id: 'workflows', label: 'Workflows', icon: Workflow },
  { id: 'memory', label: 'Memory', icon: Brain },
  { id: 'documents', label: 'Documents', icon: Code2 },
  { id: 'dashboard', label: 'Dashboard', icon: Terminal },
  { id: 'tools', label: 'Tools', icon: Zap },
  { id: 'search', label: 'Search', icon: Database },
  { id: 'vectorstore', label: 'Vector Store', icon: Database },
  { id: 'github', label: 'GitHub', icon: GitBranch },
  { id: 'performance', label: 'Performance', icon: Terminal },
  { id: 'thought-logger', label: 'Thought Logger', icon: Brain },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { isCollapsed, toggleSidebar } = useNavigationStore();
  const { theme, toggleTheme } = useTheme();

  const PANEL_COMPONENTS = {
    'chat': null,
    'agents': AgentMonitor,
    'workflows': null,
    'memory': null,
    'documents': null,
    'dashboard': null,
    'tools': null,
    'search': null,
    'vectorstore': null,
    'github': null,
    'performance': null,
    'thought-logger': ThoughtLoggerPanel,
  };

  return (
    <div className="flex h-screen overflow-hidden bg-bg-darker">
      {/* Sidebar */}
      <div
        className={cn(
          'relative bg-bg-light border-r border-r-gray-800 transition-all duration-300',
          isCollapsed ? 'w-16' : 'w-64'
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between p-4 border-b border-b-gray-800">
          <div className="flex items-center space-x-2">
            <NeonMonkey size="sm" animated={false} />
            {!isCollapsed && (
              <span className="text-lg font-semibold bg-gradient-to-r from-neon-pink to-neon-blue bg-clip-text text-transparent">
                Monkey One
              </span>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="text-gray-400 hover:text-white"
          >
            {isCollapsed ? <ChevronRight /> : <ChevronLeft />}
          </Button>
        </div>

        {/* Navigation */}
        <div className="flex-1 py-2 px-2 overflow-auto">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.id === 'chat'; // TODO: implement active tab logic

              return (
                <Tooltip key={item.id} delayDuration={0}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      className={cn(
                        'w-full flex items-center gap-3 p-3 mb-1 rounded-lg justify-start',
                        'text-gray-400 hover:text-white hover:bg-gray-800',
                        isActive && 'bg-gray-800 text-white',
                        !isCollapsed && 'justify-center px-2'
                      )}
                      onClick={() => {}}
                    >
                      <Icon size={20} />
                      {!isCollapsed && <span>{item.label}</span>}
                    </Button>
                  </TooltipTrigger>
                  {isCollapsed && (
                    <TooltipContent side="right" className="bg-gray-800 text-white">
                      {item.label}
                    </TooltipContent>
                  )}
                </Tooltip>
              );
            })}
          </nav>
        </div>

        {/* Settings and Theme Toggle */}
        <div className="p-4 border-t border-t-gray-800 flex items-center justify-between">
          <Button
            variant="ghost"
            className={cn(
              'flex items-center gap-2',
              'text-gray-400 hover:text-white hover:bg-gray-800',
              !isCollapsed && 'justify-center'
            )}
            onClick={() => {}}
          >
            <Settings size={20} />
            {!isCollapsed && <span>Settings</span>}
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="text-gray-400 hover:text-white"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden bg-gray-50 dark:bg-gray-900">
        <div className="h-full">
          {children}
        </div>
      </div>
    </div>
  );
};
