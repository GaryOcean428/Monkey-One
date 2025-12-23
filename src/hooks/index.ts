/**
 * Hooks barrel export
 * Centralized exports for all custom React hooks
 */

// Core hooks
export { useAccessibility } from './useAccessibility'
export { useAgents } from './useAgents'
export { useAuth } from './useAuth'
export { useAuthenticatedFetch } from './useAuthenticatedFetch'

// Brain/AI hooks
export { useBrainActivity } from './useBrainActivity'
export { useBrainCore } from './useBrainCore'
export { useBrainMetrics } from './useBrainMetrics'
export { useChat } from './useChat'
export { useLLM } from './useLLM'
export { useML } from './useML'

// Data hooks
export { useCodeProcessor } from './useCodeProcessor'
export { useDocuments } from './useDocuments'
export { useMemory } from './useMemory'
export { useMemoryManagement } from './useMemoryManagement'
export { useVectorStore } from './useVectorStore'

// Integration hooks
export { useGitHub } from './useGitHub'
export { useIntegrations } from './useIntegrations'
export { useToolhouse } from './useToolhouse'
export { useTools } from './useTools'

// Monitoring hooks
export { useMonitoring } from './useMonitoring'
export { useObserver } from './useObserver'
export { usePerformanceMonitoring } from './usePerformanceMonitoring'
export { useThoughtLogger } from './useThoughtLogger'

// UI/UX hooks
export { useFeatureFlag } from './useFeatureFlag'
export { useHotkeys } from './useHotkeys'
export { useIntersectionObserver } from './useIntersectionObserver'
export { useLocalStorage } from './useLocalStorage'
export { useTheme } from './useTheme'
export { useThrottledCallback } from './useThrottledCallback'

// Workflow hooks
export { useProfile } from './useProfile'
export { useSettings } from './useSettings'
export { useWorkflow } from './useWorkflow'
