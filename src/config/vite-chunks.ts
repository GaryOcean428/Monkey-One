// Manual chunks configuration for better code splitting and bundle optimization
export function manualChunks(id: string) {
  // Vendor libraries
  if (id.includes('node_modules')) {
    // React ecosystem
    if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
      return 'react-vendor'
    }
    // UI libraries
    if (
      id.includes('@radix-ui') ||
      id.includes('lucide-react') ||
      id.includes('class-variance-authority')
    ) {
      return 'ui-vendor'
    }
    // State management
    if (id.includes('zustand') || id.includes('immer')) {
      return 'state-vendor'
    }
    // Utility libraries
    if (id.includes('lodash') || id.includes('date-fns') || id.includes('clsx')) {
      return 'utils-vendor'
    }
    // AI/ML libraries
    if (id.includes('openai') || id.includes('@anthropic') || id.includes('langchain')) {
      return 'ai-vendor'
    }
    // Database/Backend
    if (id.includes('supabase') || id.includes('postgres')) {
      return 'db-vendor'
    }
    // Everything else goes to vendor
    return 'vendor'
  }

  // App code chunks
  if (id.includes('/pages/')) {
    // Group related pages
    if (id.includes('/pages/Auth/') || id.includes('Login') || id.includes('Register')) {
      return 'auth-pages'
    }
    if (id.includes('Performance') || id.includes('Analytics') || id.includes('UIShowcase')) {
      return 'showcase-pages'
    }
    return 'pages'
  }

  if (id.includes('/components/')) {
    // UI components
    if (id.includes('/components/ui/') || id.includes('/components/common/')) {
      return 'ui-components'
    }
    // Feature components
    if (id.includes('/components/chat/') || id.includes('/components/agents/')) {
      return 'feature-components'
    }
    return 'components'
  }

  // Utils and config
  if (id.includes('/utils/') || id.includes('/config/') || id.includes('/lib/')) {
    return 'app-utils'
  }

  return undefined // Default chunk
}
