/**
 * This file contains dynamic imports for large dependencies
 * and components to improve code-splitting and reduce initial chunk size.
 *
 * Use these imports instead of direct imports in your components.
 */

import React from 'react'

// Normalizes lazy imports so we always hand React a component-like default export
function lazyWithDefault<T>(importer: () => Promise<T>) {
  return React.lazy(async () => {
    const module = await importer()
    const resolved = (module as any)?.default ?? (module as any)
    return { default: resolved }
  })
}

// AI / ML libraries
export const TensorflowCore = lazyWithDefault(() => import('@tensorflow/tfjs-core'))
export const TensorflowLayers = lazyWithDefault(() => import('@tensorflow/tfjs-layers'))
export const Transformers = lazyWithDefault(() => import('@xenova/transformers'))

// Load AI libraries on demand
export function preloadAILibraries() {
  import('@tensorflow/tfjs-core')
  import('@tensorflow/tfjs-layers')
  import('@xenova/transformers')
}

// UI Component chunks
export const RadixDialog = lazyWithDefault(() => import('@radix-ui/react-dialog'))
export const RadixDropdown = lazyWithDefault(() => import('@radix-ui/react-dropdown-menu'))
export const RadixTabs = lazyWithDefault(() => import('@radix-ui/react-tabs'))

// Load UI components on demand
export function preloadUIComponents() {
  import('@radix-ui/react-dialog')
  import('@radix-ui/react-dropdown-menu')
  import('@radix-ui/react-tabs')
}

// App components
export const ChatComponents = lazyWithDefault(() => import('./components/chat/ChatContainer'))
export const AgentComponents = lazyWithDefault(() => import('./components/agents/AgentsPanel'))

// Initialize preloading based on route
export function preloadChunksByRoute(route: string) {
  // Preload chunks based on current route
  switch (route) {
    case '/chat':
      import('./components/chat/ChatContainer')
      break
    case '/agents':
      import('./components/agents/AgentsPanel')
      break
    case '/ai':
      preloadAILibraries()
      break
    default:
      // Default chunks
      break
  }
}
