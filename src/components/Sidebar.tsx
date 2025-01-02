import React from 'react'
import {
  Menu,
  MessageSquare,
  Settings,
  Brain,
  Users,
  X,
  LayoutDashboard,
  Wrench,
  Search,
  Database,
  FileText,
  Github,
  Activity,
  Network,
  UserCircle,
} from 'lucide-react'
import { useNavigationStore } from '../store/navigationStore'
import { Link, useLocation } from 'react-router-dom'

export function Sidebar() {
  const { isCollapsed, toggleSidebar } = useNavigationStore()
  const location = useLocation()

  const tabs = [
    { id: 'chat', label: 'Chat', icon: MessageSquare, path: '/' },
    { id: 'agents', label: 'Agents', icon: Users, path: '/agents' },
    { id: 'workflows', label: 'Workflows', icon: Network, path: '/workflows' },
    { id: 'memory', label: 'Memory', icon: Brain, path: '/memory' },
    { id: 'documents', label: 'Documents', icon: FileText, path: '/documents' },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { id: 'tools', label: 'Tools', icon: Wrench, path: '/tools' },
    { id: 'search', label: 'Search', icon: Search, path: '/search' },
    { id: 'vectorstore', label: 'Vector Store', icon: Database, path: '/vectorstore' },
    { id: 'github', label: 'GitHub', icon: Github, path: '/github' },
    { id: 'performance', label: 'Performance', icon: Activity, path: '/performance' },
  ]

  const userTabs = [
    { id: 'profile', label: 'Profile', icon: UserCircle, path: '/profile' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
  ]

  return (
    <div
      className={`${!isCollapsed ? 'w-64' : 'w-16'} flex flex-col bg-gray-900 transition-all duration-300`}
    >
      <div className="flex items-center p-4">
        <button
          onClick={toggleSidebar}
          className="rounded-lg p-2 text-gray-400 hover:bg-gray-800 hover:text-white"
        >
          {!isCollapsed ? <X size={24} /> : <Menu size={24} />}
        </button>
        {!isCollapsed && <span className="ml-2 font-semibold text-white">Monkey One</span>}
      </div>

      <nav className="flex-1 overflow-y-auto">
        {tabs.map(tab => {
          const Icon = tab.icon
          const isActive = location.pathname === tab.path
          return (
            <Link
              key={tab.id}
              to={tab.path}
              className={`flex items-center px-4 py-2 text-sm ${
                isActive
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Icon size={20} />
              {!isCollapsed && <span className="ml-3">{tab.label}</span>}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-gray-800 pt-2">
        {userTabs.map(tab => {
          const Icon = tab.icon
          const isActive = location.pathname === tab.path
          return (
            <Link
              key={tab.id}
              to={tab.path}
              className={`flex items-center px-4 py-2 text-sm ${
                isActive
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Icon size={20} />
              {!isCollapsed && <span className="ml-3">{tab.label}</span>}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
