import * as React from 'react'

// Centralized component lazy loading to eliminate duplication
export const lazyComponents = {
  // Main pages
  Dashboard: React.lazy(() =>
    import('../pages/Dashboard').then(module => ({
      default: module.default || module.Dashboard || module,
    }))
  ),
  Chat: React.lazy(() =>
    import('../pages/Chat').then(module => ({
      default: module.default || module.Chat || module,
    }))
  ),
  Agents: React.lazy(() =>
    import('../pages/Agents').then(module => ({
      default: module.default || module.Agents || module,
    }))
  ),
  Workflow: React.lazy(() =>
    import('../pages/Workflow').then(module => ({
      default: module.default || module.Workflow || module,
    }))
  ),
  Tools: React.lazy(() =>
    import('../pages/Tools').then(module => ({
      default: module.default || module.Tools || module,
    }))
  ),
  Documents: React.lazy(() =>
    import('../pages/Documents').then(module => ({
      default: module.default || module.Documents || module,
    }))
  ),
  Analytics: React.lazy(() =>
    import('../pages/Performance').then(module => ({
      default: module.default || module.Performance || module,
    }))
  ),
  Settings: React.lazy(() =>
    import('../pages/Settings').then(module => ({
      default: module.default || module.Settings || module,
    }))
  ),

  // Auth pages
  Login: React.lazy(() =>
    import('../pages/Login').then(module => ({
      default: module.default || module.Login || module,
    }))
  ),
  Register: React.lazy(() =>
    import('../pages/Register').then(module => ({
      default: module.default || module.Register || module,
    }))
  ),
  AuthCallback: React.lazy(() =>
    import('../pages/Auth/AuthCallback').then(module => ({
      default: module.default || module.AuthCallback || module,
    }))
  ),
  PasswordReset: React.lazy(() =>
    import('../pages/Auth/PasswordReset').then(module => ({
      default: module.default || module.PasswordReset || module,
    }))
  ),

  // Feature pages
  AI: React.lazy(() =>
    import('../pages/AI').then(module => ({
      default: module.default || module.AI || module,
    }))
  ),
  Notes: React.lazy(() =>
    import('../pages/Notes').then(module => ({
      default: module.default || module.Notes || module,
    }))
  ),
  UIShowcase: React.lazy(() =>
    import('../pages/UIShowcase').then(module => ({
      default: module.default || module.UIShowcase || module,
    }))
  ),
  PerformanceAccessibilityShowcase: React.lazy(() =>
    import('../pages/PerformanceAccessibilityShowcase').then(module => ({
      default: module.default || module.PerformanceAccessibilityShowcase || module,
    }))
  ),

  // Component panels
  ChatContainer: React.lazy(() =>
    import('../components/chat/ChatContainer').then(module => ({
      default: module.default || module.ChatContainer || module,
    }))
  ),
  AgentsPanel: React.lazy(() =>
    import('../components/agents/AgentsPanel').then(module => ({
      default: module.default || module.AgentsPanel || module,
    }))
  ),
  WorkflowPanel: React.lazy(() =>
    import('../components/workflow/WorkflowPanel').then(module => ({
      default: module.default || module.WorkflowPanel || module,
    }))
  ),
  ToolsPanel: React.lazy(() =>
    import('../components/tools/ToolsPanel').then(module => ({
      default: module.default || module.ToolsPanel || module,
    }))
  ),
  GithubPanel: React.lazy(() =>
    import('../pages/Github').then(module => ({
      default: module.default || module.GithubPanel || module,
    }))
  ),

  // Actual implemented components
  MemoryManager: React.lazy(() =>
    import('../components/memory/MemoryManager').then(module => ({
      default: module.default || module.MemoryManager || module,
    }))
  ),
  ProfileManager: React.lazy(() =>
    import('../pages/ProfileManager').then(module => ({
      default: module.default || module.ProfileManager || module,
    }))
  ),
}

export function getComponentByName(componentName: string): React.LazyExoticComponent<any> {
  const component = lazyComponents[componentName as keyof typeof lazyComponents]
  if (!component) {
    console.warn(`Component "${componentName}" not found, returning fallback`)
    return React.lazy(() =>
      Promise.resolve({
        default: () => <div className="p-4">Component "{componentName}" not implemented</div>,
      })
    )
  }
  return component
}
