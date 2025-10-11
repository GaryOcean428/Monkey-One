import * as React from 'react'

type ComponentModule = {
  default?: React.ComponentType<unknown>
  [key: string]: unknown
}

function resolveComponent(module: ComponentModule, namedExport?: string) {
  if (module.default && typeof module.default === 'function') {
    return module.default as React.ComponentType<any>
  }

  if (namedExport && typeof module[namedExport] === 'function') {
    return module[namedExport] as React.ComponentType<any>
  }

  if (typeof module === 'function') {
    return module as unknown as React.ComponentType<any>
  }

  return () => (
    <div className="flex items-center justify-center p-8">
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          Component Unavailable
        </h3>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          The requested component could not be loaded.
        </p>
      </div>
    </div>
  )
}

function lazyComponent(importer: () => Promise<ComponentModule>, namedExport?: string) {
  return React.lazy(async () => {
    const module = await importer()
    const component = resolveComponent(module, namedExport)
    return { default: component }
  })
}

// Centralized component lazy loading to eliminate duplication
export const lazyComponents = {
  Dashboard: lazyComponent(() => import('../pages/Dashboard'), 'Dashboard'),
  Chat: lazyComponent(() => import('../pages/Chat'), 'Chat'),
  Agents: lazyComponent(() => import('../pages/Agents'), 'Agents'),
  Workflow: lazyComponent(() => import('../pages/Workflow'), 'Workflow'),
  Tools: lazyComponent(() => import('../pages/Tools'), 'Tools'),
  Documents: lazyComponent(() => import('../pages/Documents'), 'Documents'),
  Analytics: lazyComponent(() => import('../pages/Performance'), 'Performance'),
  Settings: lazyComponent(() => import('../pages/Settings'), 'Settings'),
  Login: lazyComponent(() => import('../pages/Login'), 'Login'),
  Register: lazyComponent(() => import('../pages/Register'), 'Register'),
  AuthCallback: lazyComponent(() => import('../pages/AuthCallback'), 'AuthCallback'),
  AuthTest: lazyComponent(() => import('../pages/AuthTest'), 'AuthTest'),
  PasswordReset: lazyComponent(() => import('../pages/Auth/PasswordReset'), 'PasswordReset'),
  AI: lazyComponent(() => import('../pages/AI'), 'AI'),
  Notes: lazyComponent(() => import('../pages/Notes'), 'Notes'),
  UIShowcase: lazyComponent(() => import('../pages/UIShowcase'), 'UIShowcase'),
  PerformanceAccessibilityShowcase: lazyComponent(
    () => import('../pages/PerformanceAccessibilityShowcase'),
    'PerformanceAccessibilityShowcase'
  ),
  ChatContainer: lazyComponent(() => import('../components/chat/ChatContainer'), 'ChatContainer'),
  AgentsPanel: lazyComponent(() => import('../components/agents/AgentsPanel'), 'AgentsPanel'),
  WorkflowPanel: lazyComponent(
    () => import('../components/workflow/WorkflowPanel'),
    'WorkflowPanel'
  ),
  ToolsPanel: lazyComponent(() => import('../components/tools/ToolsPanel'), 'ToolsPanel'),
  GithubPanel: lazyComponent(() => import('../pages/Github'), 'GithubPanel'),
  MemoryManager: lazyComponent(() => import('../components/memory/MemoryManager'), 'MemoryManager'),
  ProfileManager: lazyComponent(() => import('../pages/ProfileManager'), 'ProfileManager'),
}

export function getComponentByName(componentName: string): React.LazyExoticComponent<any> {
  const component = lazyComponents[componentName as keyof typeof lazyComponents]

  if (!component) {
    console.warn(`Component "${componentName}" not found, returning fallback`)
    return lazyComponent(async () => ({}))
  }

  return component
}
