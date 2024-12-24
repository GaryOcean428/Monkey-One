import React from 'react';
import { cn } from '@/lib/utils';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Brain,
  Settings,
  History,
  Tool,
  Home,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
}

const navItems: NavItem[] = [
  { icon: Home, label: 'Dashboard', path: '/' },
  { icon: Brain, label: 'Memory', path: '/memory' },
  { icon: Tool, label: 'Tools', path: '/tools' },
  { icon: History, label: 'History', path: '/history' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div
        className={cn(
          'border-r bg-card transition-all duration-300',
          collapsed ? 'w-16' : 'w-64'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between px-4">
            {!collapsed && (
              <span className="text-xl font-semibold">Monkey One</span>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCollapsed(!collapsed)}
              className="h-8 w-8"
            >
              {collapsed ? <ChevronRight /> : <ChevronLeft />}
            </Button>
          </div>

          <Separator />

          {/* Navigation */}
          <ScrollArea className="flex-1 py-4">
            <nav className="space-y-2 px-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;

                return (
                  <Tooltip key={item.path} delayDuration={0}>
                    <TooltipTrigger asChild>
                      <Button
                        variant={isActive ? 'secondary' : 'ghost'}
                        className={cn(
                          'w-full justify-start',
                          collapsed && 'justify-center'
                        )}
                        onClick={() => navigate(item.path)}
                      >
                        <Icon className={cn(
                          'h-5 w-5',
                          collapsed ? 'mr-0' : 'mr-2'
                        )} />
                        {!collapsed && item.label}
                      </Button>
                    </TooltipTrigger>
                    {collapsed && (
                      <TooltipContent side="right">
                        {item.label}
                      </TooltipContent>
                    )}
                  </Tooltip>
                );
              })}
            </nav>
          </ScrollArea>

          <Separator />

          {/* User Section */}
          <div className="p-4">
            <Button
              variant="ghost"
              className={cn(
                'w-full justify-start',
                collapsed && 'justify-center'
              )}
            >
              <Settings className={cn(
                'h-5 w-5',
                collapsed ? 'mr-0' : 'mr-2'
              )} />
              {!collapsed && 'Profile'}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto py-6">
          {children}
        </div>
      </div>
    </div>
  );
};
