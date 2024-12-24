import React from 'react';
import { Link, useLocation } from 'react-router-dom';
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
import { useNavigationStore } from '../../store/navigationStore';
import { useTheme } from '../ThemeProvider';

const navItems = [
  { href: '/', icon: MessageSquare, label: 'Chat' },
  { href: '/agents', icon: Brain, label: 'Agents' },
  { href: '/workflow', icon: Workflow, label: 'Workflow' },
  { href: '/memory', icon: Database, label: 'Memory' },
  { href: '/documents', icon: Code2, label: 'Documents' },
  { href: '/tools', icon: Terminal, label: 'Tools' },
  { href: '/github', icon: GitBranch, label: 'GitHub' },
  { href: '/performance', icon: Zap, label: 'Performance' },
  { href: '/settings', icon: Settings, label: 'Settings' },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const location = useLocation();
  const { isCollapsed, toggleSidebar } = useNavigationStore();
  const { theme, setTheme } = useTheme();

  return (
    <div className="relative flex min-h-screen">
      {/* Sidebar */}
      <div
        className={cn(
          'fixed left-0 top-0 z-40 flex h-full flex-col border-r bg-background transition-all duration-300',
          isCollapsed ? 'w-16' : 'w-64'
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-4">
          {!isCollapsed && <NeonMonkey className="h-8 w-8" />}
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto"
            onClick={toggleSidebar}
          >
            {isCollapsed ? <ChevronRight /> : <ChevronLeft />}
          </Button>
        </div>
        <Separator />

        {/* Navigation */}
        <ScrollArea className="flex-1 py-4">
          <nav className="grid gap-1 px-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  location.pathname === item.href
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <item.icon className="h-4 w-4" />
                {!isCollapsed && <span>{item.label}</span>}
              </Link>
            ))}
          </nav>
        </ScrollArea>

        {/* Theme Toggle */}
        <div className="p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="w-full"
          >
            {theme === 'light' ? (
              <Moon className="h-4 w-4" />
            ) : (
              <Sun className="h-4 w-4" />
            )}
            {!isCollapsed && (
              <span className="ml-2">
                {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <main
        className={cn(
          'flex-1 overflow-hidden transition-all duration-300',
          isCollapsed ? 'ml-16' : 'ml-64'
        )}
      >
        <div className="container mx-auto h-full p-8">{children}</div>
      </main>
    </div>
  );
}
