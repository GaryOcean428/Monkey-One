import React from 'react';
import { cn } from '@/lib/utils';
import {
  MessageSquare,
  Settings,
  Brain,
  Users,
  LayoutDashboard,
  Wrench,
  Search,
  Database,
  FileText,
  Github,
  Activity,
  Network,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useNavigationStore } from '@/store/navigationStore';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { ThoughtLoggerPanel } from '../panels/ThoughtLoggerPanel';
import { AgentMonitor } from '../panels/AgentMonitor';

const navItems = [
  { id: 'chat', label: 'Chat', icon: MessageSquare },
  { id: 'agents', label: 'Agents', icon: Users },
  { id: 'workflows', label: 'Workflows', icon: Network },
  { id: 'memory', label: 'Memory', icon: Brain },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'tools', label: 'Tools', icon: Wrench },
  { id: 'search', label: 'Search', icon: Search },
  { id: 'vectorstore', label: 'Vector Store', icon: Database },
  { id: 'github', label: 'GitHub', icon: Github },
  { id: 'performance', label: 'Performance', icon: Activity },
  { id: 'thought-logger', label: 'Thought Logger', icon: Brain },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = React.useState(false);
  const { activeTab, setActiveTab } = useNavigationStore();
  const [showSettings, setShowSettings] = React.useState(false);

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

  const DEFAULT_LAYOUT = {
    'chat': {
      title: 'Chat',
      type: 'chat',
      x: 0,
      y: 0,
      width: 6,
      height: 4,
    },
    'agents': {
      title: 'Agents',
      type: 'agents',
      x: 6,
      y: 0,
      width: 6,
      height: 4,
    },
    'workflows': {
      title: 'Workflows',
      type: 'workflows',
      x: 0,
      y: 4,
      width: 6,
      height: 4,
    },
    'memory': {
      title: 'Memory',
      type: 'memory',
      x: 6,
      y: 4,
      width: 6,
      height: 4,
    },
    'documents': {
      title: 'Documents',
      type: 'documents',
      x: 0,
      y: 8,
      width: 6,
      height: 4,
    },
    'dashboard': {
      title: 'Dashboard',
      type: 'dashboard',
      x: 6,
      y: 8,
      width: 6,
      height: 4,
    },
    'tools': {
      title: 'Tools',
      type: 'tools',
      x: 0,
      y: 12,
      width: 6,
      height: 4,
    },
    'search': {
      title: 'Search',
      type: 'search',
      x: 6,
      y: 12,
      width: 6,
      height: 4,
    },
    'vectorstore': {
      title: 'Vector Store',
      type: 'vectorstore',
      x: 0,
      y: 16,
      width: 6,
      height: 4,
    },
    'github': {
      title: 'GitHub',
      type: 'github',
      x: 6,
      y: 16,
      width: 6,
      height: 4,
    },
    'performance': {
      title: 'Performance',
      type: 'performance',
      x: 0,
      y: 20,
      width: 6,
      height: 4,
    },
    'thought-logger': {
      title: 'Thought Logger',
      type: 'thought-logger',
      x: 6,
      y: 20,
      width: 6,
      height: 4,
    },
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div
        className={cn(
          'relative h-full bg-gray-900 flex flex-col transition-all duration-300',
          collapsed ? 'w-16' : 'w-64'
        )}
      >
        {/* Logo */}
        <div className="flex items-center p-4 border-b border-gray-800">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              'p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg',
              !collapsed && 'mx-auto'
            )}
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </Button>
          {!collapsed && (
            <span className="text-white ml-2 font-semibold">Monkey One</span>
          )}
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 py-2 px-2">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <Tooltip key={item.id} delayDuration={0}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      className={cn(
                        'w-full flex items-center gap-3 p-3 mb-1 rounded-lg justify-start',
                        'text-gray-400 hover:text-white hover:bg-gray-800',
                        isActive && 'bg-gray-800 text-white',
                        !collapsed && 'justify-center px-2'
                      )}
                      onClick={() => setActiveTab(item.id)}
                    >
                      <Icon size={20} />
                      {!collapsed && <span>{item.label}</span>}
                    </Button>
                  </TooltipTrigger>
                  {collapsed && (
                    <TooltipContent side="right" className="bg-gray-800 text-white">
                      {item.label}
                    </TooltipContent>
                  )}
                </Tooltip>
              );
            })}
          </nav>
        </ScrollArea>

        <Separator className="bg-gray-800" />

        {/* Settings */}
        <div className="p-4 border-t border-gray-800">
          <Button
            variant="ghost"
            className={cn(
              'w-full flex items-center gap-3 p-2 rounded-lg',
              'text-gray-400 hover:text-white hover:bg-gray-800',
              !collapsed && 'justify-center'
            )}
            onClick={() => setShowSettings(true)}
          >
            <Settings size={20} />
            {!collapsed && <span>Settings</span>}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden bg-gray-50 dark:bg-gray-900">
        <Tabs value={activeTab} className="h-full">
          {children}
        </Tabs>
      </div>
    </div>
  );
};
