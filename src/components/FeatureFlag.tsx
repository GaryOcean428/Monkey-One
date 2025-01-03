import React from 'react'
import { useFeatureFlag } from '../hooks/useFeatureFlag'

interface FeatureFlagProps {
  flagKey: string
  children: React.ReactNode
  fallback?: React.ReactNode
  loadingFallback?: React.ReactNode
}

export function FeatureFlag({
  flagKey,
  children,
  fallback = null,
  loadingFallback = null,
}: FeatureFlagProps) {
  const [isEnabled, loading, error] = useFeatureFlag(flagKey, false)

  if (loading) {
    return loadingFallback
  }

  if (error) {
    console.error(`Error loading feature flag ${flagKey}:`, error)
    return fallback
  }

  return isEnabled ? children : fallback
}
