/**
 * This file contains dynamic imports for large dependencies
 * and components to improve code-splitting and reduce initial chunk size.
 *
 * Use these imports instead of direct imports in your components.
 */

import React from 'react'

// AI / ML libraries
export const TensorflowCore = React.lazy(() => import('@tensorflow/tfjs-core'))
export const TensorflowLayers = React.lazy(() => import('@tensorflow/tfjs-layers'))
export const Transformers = React.lazy(() => import('@xenova/transformers'))

// Load AI libraries on demand
export function preloadAILibraries() {
  import('@tensorflow/tfjs-core')
  import('@tensorflow/tfjs-layers')
  import('@xenova/transformers')
}

// UI Component chunks
export const RadixDialog = React.lazy(() => import('@radix-ui/react-dialog'))
export const RadixDropdown = React.lazy(() => import('@radix-ui/react-dropdown-menu'))
export const RadixTabs = React.lazy(() => import('@radix-ui/react-tabs'))

// Load UI components on demand
export function preloadUIComponents() {
  import('@radix-ui/react-dialog')
  import('@radix-ui/react-dropdown-menu')
  import('@radix-ui/react-tabs')
}

// App components
export const ChatComponents = React.lazy(() => import('./components/chat/ChatContainer'))
export const AgentComponents = React.lazy(() => import('./components/agents/AgentsPanel'))

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
