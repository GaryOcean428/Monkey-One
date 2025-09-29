import * as React from 'react'

// Centralized component lazy loading to eliminate duplication
export const lazyComponents = {
  // Main pages
  Dashboard: React.lazy(() =>
    import('../pages/Dashboard').then(mod => ({
      default:
        (mod as { default?: React.ComponentType<any> }).default ??
        (mod as unknown as React.ComponentType<any>),
    }))
  ),
  Chat: React.lazy(() =>
    import('../pages/Chat').then(mod => ({
      default:
        (mod as { default?: React.ComponentType<any> }).default ??
        (mod as unknown as React.ComponentType<any>),
    }))
  ),
  Agents: React.lazy(() =>
    import('../pages/Agents').then(mod => ({
      default:
        (mod as { default?: React.ComponentType<any> }).default ??
        (mod as unknown as React.ComponentType<any>),
    }))
  ),
  Workflow: React.lazy(() =>
    import('../pages/Workflow').then(mod => ({
      default:
        (mod as { default?: React.ComponentType<any> }).default ??
        (mod as unknown as React.ComponentType<any>),
    }))
  ),
  Tools: React.lazy(() =>
    import('../pages/Tools').then(mod => ({
      default:
        (mod as { default?: React.ComponentType<any> }).default ??
        (mod as unknown as React.ComponentType<any>),
    }))
  ),
  Documents: React.lazy(() =>
    import('../pages/Documents').then(mod => ({
      default:
        (mod as { default?: React.ComponentType<any> }).default ??
        (mod as unknown as React.ComponentType<any>),
    }))
  ),
  Analytics: React.lazy(() =>
    import('../pages/Performance').then(mod => ({
      default:
        (mod as { default?: React.ComponentType<any> }).default ??
        (mod as unknown as React.ComponentType<any>),
    }))
  ),
  Settings: React.lazy(() =>
    import('../pages/Settings').then(mod => ({
      default:
        (mod as { default?: React.ComponentType<any> }).default ??
        (mod as unknown as React.ComponentType<any>),
    }))
  ),

  // Auth pages
  Login: React.lazy(() =>
    import('../pages/Login').then(mod => ({
      default:
        (mod as { default?: React.ComponentType<any> }).default ??
        (mod as unknown as React.ComponentType<any>),
    }))
  ),
  Register: React.lazy(() =>
    import('../pages/Register').then(mod => ({
      default:
        (mod as { default?: React.ComponentType<any> }).default ??
        (mod as unknown as React.ComponentType<any>),
    }))
  ),
  AuthCallback: React.lazy(() =>
    import('../pages/Auth/AuthCallback').then(mod => ({
      default:
        (mod as { default?: React.ComponentType<any> }).default ??
        (mod as unknown as React.ComponentType<any>),
    }))
  ),
  PasswordReset: React.lazy(() =>
    import('../pages/Auth/PasswordReset').then(mod => ({
      default:
        (mod as { default?: React.ComponentType<any> }).default ??
        (mod as unknown as React.ComponentType<any>),
    }))
  ),

  // Feature pages
  AI: React.lazy(() =>
    import('../pages/AI').then(mod => ({
      default:
        (mod as { default?: React.ComponentType<any> }).default ??
        (mod as unknown as React.ComponentType<any>),
    }))
  ),
  Notes: React.lazy(() =>
    import('../pages/Notes').then(mod => ({
      default:
        (mod as { default?: React.ComponentType<any> }).default ??
        (mod as unknown as React.ComponentType<any>),
    }))
  ),
  UIShowcase: React.lazy(() =>
    import('../pages/UIShowcase').then(mod => ({
      default:
        (mod as { default?: React.ComponentType<any> }).default ??
        (mod as unknown as React.ComponentType<any>),
    }))
  ),
  PerformanceAccessibilityShowcase: React.lazy(() =>
    import('../pages/PerformanceAccessibilityShowcase').then(mod => ({
      default:
        (mod as { default?: React.ComponentType<any> }).default ??
        (mod as unknown as React.ComponentType<any>),
    }))
  ),

  // Component panels
  ChatContainer: React.lazy(() =>
    import('../components/chat/ChatContainer').then(mod => ({
      default:
        (mod as { default?: React.ComponentType<any> }).default ??
        (mod as unknown as React.ComponentType<any>),
    }))
  ),
  AgentsPanel: React.lazy(() =>
    import('../components/agents/AgentsPanel').then(mod => ({
      default:
        (mod as { default?: React.ComponentType<any> }).default ??
        (mod as unknown as React.ComponentType<any>),
    }))
  ),
  WorkflowPanel: React.lazy(() =>
    import('../components/workflow/WorkflowPanel').then(mod => ({
      default:
        (mod as { default?: React.ComponentType<any> }).default ??
        (mod as unknown as React.ComponentType<any>),
    }))
  ),
  ToolsPanel: React.lazy(() =>
    import('../components/tools/ToolsPanel').then(mod => ({
      default:
        (mod as { default?: React.ComponentType<any> }).default ??
        (mod as unknown as React.ComponentType<any>),
    }))
  ),
  GithubPanel: React.lazy(() =>
    import('../pages/Github').then(mod => ({
      default:
        (mod as { default?: React.ComponentType<any> }).default ??
        (mod as unknown as React.ComponentType<any>),
    }))
  ),

  // Actual implemented components
  MemoryManager: React.lazy(() =>
    import('../components/memory/MemoryManager').then(mod => ({
      default:
        (mod as { default?: React.ComponentType<any> }).default ??
        (mod as unknown as React.ComponentType<any>),
    }))
  ),
  ProfileManager: React.lazy(() =>
    import('../pages/ProfileManager').then(mod => ({
      default:
        (mod as { default?: React.ComponentType<any> }).default ??
        (mod as unknown as React.ComponentType<any>),
    }))
  ),
}

export function getComponentByName(
  componentName: string
): React.LazyExoticComponent<React.ComponentType<any>> {
  const component = lazyComponents[componentName as keyof typeof lazyComponents]
  if (!component) {
    console.warn(`Component "${componentName}" not found, returning fallback`)
    return React.lazy(() =>
      Promise.resolve({
        default: () => (
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Component Not Available
              </h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                The "{componentName}" component is not yet implemented.
              </p>
            </div>
          </div>
        ),
      })
    )
  }

  // Component already lazy-loaded; return directly
  return component
}
