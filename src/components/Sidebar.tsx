import { useEffect } from 'react'
import { Menu, X } from 'lucide-react'
import { useNavigationStore } from '../store/navigationStore'
import { useLocation, useNavigate } from 'react-router-dom'
import { getMainRoutes, getUserRoutes } from '@/config/routes'

export function Sidebar() {
  const { isCollapsed, toggleSidebar, setActiveTab } = useNavigationStore()
  const location = useLocation()
  const navigate = useNavigate()

  // Use centralized route configuration
  const tabs = getMainRoutes()
  const userTabs = getUserRoutes()

  // Sync active tab with current route
  useEffect(() => {
    const currentPath = location.pathname.substring(1) // Remove leading slash
    const tab = [...tabs, ...userTabs].find(t => t.path.substring(1) === currentPath)
    if (tab) {
      setActiveTab(tab.id)
    }
  }, [location.pathname, setActiveTab])

  const handleTabClick = (path: string, id: string) => {
    setActiveTab(id)
    navigate(path)
  }

  return (
    <div
      className={`${!isCollapsed ? 'w-64' : 'w-16'} flex flex-col bg-gray-900 transition-all duration-300`}
    >
      <div className="flex items-center p-4">
        <button
          onClick={toggleSidebar}
          className="rounded-lg p-2 text-gray-400 hover:bg-gray-800 hover:text-white"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {!isCollapsed ? <X size={24} /> : <Menu size={24} />}
        </button>
        {!isCollapsed && <span className="ml-2 font-semibold text-white">Monkey One</span>}
      </div>

      <nav className="flex-1 overflow-y-auto" role="navigation">
        {tabs.map(tab => {
          const Icon = tab.icon
          const isActive = location.pathname === tab.path
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.path, tab.id)}
              className={`flex w-full items-center px-4 py-2 text-sm ${
                isActive
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon size={20} aria-hidden="true" />
              {!isCollapsed && <span className="ml-3">{tab.label}</span>}
            </button>
          )
        })}
      </nav>

      <div className="border-t border-gray-800 pt-2">
        {userTabs.map(tab => {
          const Icon = tab.icon
          const isActive = location.pathname === tab.path
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.path, tab.id)}
              className={`flex w-full items-center px-4 py-2 text-sm ${
                isActive
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon size={20} aria-hidden="true" />
              {!isCollapsed && <span className="ml-3">{tab.label}</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}
