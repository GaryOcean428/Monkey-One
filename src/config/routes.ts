import {
  LayoutDashboard,
  MessageSquare,
  Users,
  Network,
  Brain,
  FileText,
  Wrench,
  Github,
  Activity,
  UserCircle,
  Settings,
} from 'lucide-react'

export interface RouteConfig {
  id: string
  path: string
  label: string
  icon?: any
  component: string
  isProtected?: boolean
  showInSidebar?: boolean
  sidebarGroup?: 'main' | 'user'
}

// Centralized route configuration to eliminate duplication
export const routeConfigs: RouteConfig[] = [
  {
    id: 'dashboard',
    path: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    component: 'Dashboard',
    showInSidebar: true,
    sidebarGroup: 'main',
  },
  {
    id: 'chat',
    path: '/chat',
    label: 'Chat',
    icon: MessageSquare,
    component: 'Chat',
    showInSidebar: true,
    sidebarGroup: 'main',
  },
  {
    id: 'agents',
    path: '/agents',
    label: 'Agents',
    icon: Users,
    component: 'Agents',
    showInSidebar: true,
    sidebarGroup: 'main',
  },
  {
    id: 'workflow',
    path: '/workflow',
    label: 'Workflow',
    icon: Network,
    component: 'Workflow',
    showInSidebar: true,
    sidebarGroup: 'main',
  },
  {
    id: 'memory-manager',
    path: '/memory-manager',
    label: 'Memory',
    icon: Brain,
    component: 'MemoryManager',
    isProtected: true,
    showInSidebar: true,
    sidebarGroup: 'main',
  },
  {
    id: 'documents',
    path: '/documents',
    label: 'Documents',
    icon: FileText,
    component: 'Documents',
    showInSidebar: true,
    sidebarGroup: 'main',
  },
  {
    id: 'tools',
    path: '/tools',
    label: 'Tools',
    icon: Wrench,
    component: 'Tools',
    showInSidebar: true,
    sidebarGroup: 'main',
  },
  {
    id: 'github',
    path: '/github',
    label: 'GitHub',
    icon: Github,
    component: 'GithubPanel',
    showInSidebar: true,
    sidebarGroup: 'main',
  },
  {
    id: 'analytics',
    path: '/analytics',
    label: 'Performance',
    icon: Activity,
    component: 'Analytics',
    showInSidebar: true,
    sidebarGroup: 'main',
  },
  {
    id: 'profile-manager',
    path: '/profile-manager',
    label: 'Profile',
    icon: UserCircle,
    component: 'ProfileManager',
    isProtected: true,
    showInSidebar: true,
    sidebarGroup: 'user',
  },
  {
    id: 'settings',
    path: '/settings',
    label: 'Settings',
    icon: Settings,
    component: 'Settings',
    showInSidebar: true,
    sidebarGroup: 'user',
  },
  // Additional routes not shown in sidebar
  {
    id: 'ui-showcase',
    path: '/ui-showcase',
    label: 'UI Showcase',
    component: 'UIShowcase',
    showInSidebar: false,
  },
  {
    id: 'performance-accessibility',
    path: '/performance-accessibility',
    label: 'Performance & Accessibility',
    component: 'PerformanceAccessibilityShowcase',
    showInSidebar: false,
  },
  {
    id: 'auth-callback',
    path: '/auth/callback',
    label: 'Auth Callback',
    component: 'AuthCallback',
    showInSidebar: false,
  },
  {
    id: 'reset-password',
    path: '/reset-password',
    label: 'Reset Password',
    component: 'PasswordReset',
    showInSidebar: false,
  },
  {
    id: 'ai',
    path: '/ai',
    label: 'AI',
    component: 'AI',
    showInSidebar: false,
  },
  {
    id: 'notes',
    path: '/notes',
    label: 'Notes',
    component: 'Notes',
    showInSidebar: false,
  },
  {
    id: 'auth-test',
    path: '/auth-test',
    label: 'Auth Test',
    component: 'AuthTest',
    showInSidebar: false,
  },
  {
    id: 'auth-debug',
    path: '/auth-debug',
    label: 'Auth Debug',
    component: 'AuthDebug',
    showInSidebar: false,
  },
  // Panel routes
  {
    id: 'chat-container',
    path: '/chat-container',
    label: 'Chat Container',
    component: 'ChatContainer',
    isProtected: true,
    showInSidebar: false,
  },
  {
    id: 'agents-panel',
    path: '/agents-panel',
    label: 'Agents Panel',
    component: 'AgentsPanel',
    isProtected: true,
    showInSidebar: false,
  },
  {
    id: 'workflow-panel',
    path: '/workflow-panel',
    label: 'Workflow Panel',
    component: 'WorkflowPanel',
    isProtected: true,
    showInSidebar: false,
  },
  {
    id: 'tools-panel',
    path: '/tools-panel',
    label: 'Tools Panel',
    component: 'ToolsPanel',
    isProtected: true,
    showInSidebar: false,
  },
]

// Helper functions for route management
export const getMainRoutes = () => routeConfigs.filter(route => route.sidebarGroup === 'main')
export const getUserRoutes = () => routeConfigs.filter(route => route.sidebarGroup === 'user')
export const getSidebarRoutes = () => routeConfigs.filter(route => route.showInSidebar)
export const getRouteById = (id: string) => routeConfigs.find(route => route.id === id)
export const getRouteByPath = (path: string) => routeConfigs.find(route => route.path === path)
