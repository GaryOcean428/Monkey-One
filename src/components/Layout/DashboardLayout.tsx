import React, { useState, useEffect } from 'react'
import { Link } from 'react-router'
import { Outlet } from 'react-router'
import {
  IconChat,
  IconAgent,
  IconWorkflow,
  IconMemory,
  IconDocument,
  IconDashboard,
  IconTool,
  IconSearch,
  IconVectorStore,
  IconGithub,
  IconPerformance,
  IconSettings,
  IconSun,
  IconMoon,
} from '../ui/icons'

interface NavItemProps {
  to: string
  icon: React.ReactNode
  label: string
  isActive?: boolean
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label, isActive }) => (
  <Link
    to={to}
    className={`flex items-center gap-3 rounded-lg px-4 py-2 transition-colors ${
      isActive ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50 text-muted-foreground'
    }`}
  >
    {icon}
    <span>{label}</span>
  </Link>
)

export const DashboardLayout: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')

  useEffect(() => {
    // Check system preference
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    setTheme(isDark ? 'dark' : 'light')

    // Apply theme
    document.documentElement.classList.toggle('dark', isDark)
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    document.documentElement.classList.toggle('dark', newTheme === 'dark')
  }

  return (
    <div className="flex h-screen">
      {/* Left Sidebar */}
      <aside className="border-border bg-background w-64 border-r">
        <div className="flex h-full flex-col">
          <div className="p-6">
            <h1 className="text-xl font-bold">Monkey One</h1>
          </div>

          <nav className="flex-1 space-y-1 px-2">
            <NavItem to="/" icon={<IconDashboard />} label="Dashboard" />
            <NavItem to="/chat" icon={<IconChat />} label="Chat" />
            <NavItem to="/agents" icon={<IconAgent />} label="Agents" />
            <NavItem to="/workflows" icon={<IconWorkflow />} label="Workflows" />
            <NavItem to="/memory" icon={<IconMemory />} label="Memory" />
            <NavItem to="/documents" icon={<IconDocument />} label="Documents" />
            <NavItem to="/tools" icon={<IconTool />} label="Tools" />
            <NavItem to="/search" icon={<IconSearch />} label="Search" />
            <NavItem to="/vector-store" icon={<IconVectorStore />} label="Vector Store" />
            <NavItem to="/github" icon={<IconGithub />} label="GitHub" />
            <NavItem to="/performance" icon={<IconPerformance />} label="Performance" />
            <NavItem to="/settings" icon={<IconSettings />} label="Settings" />
          </nav>

          <div className="border-border border-t p-4">
            <button
              onClick={toggleTheme}
              className="hover:bg-accent/50 flex w-full items-center gap-2 rounded-lg p-2"
            >
              {theme === 'light' ? (
                <IconMoon className="h-5 w-5" />
              ) : (
                <IconSun className="h-5 w-5" />
              )}
              <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
