import { useRemoteConfig } from '@/lib/firebase/hooks/useRemoteConfig';

interface FeatureFlagProps {
  flagKey: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  loadingFallback?: React.ReactNode;
}

export function FeatureFlag({ flagKey, children, fallback = null, loadingFallback = null }: FeatureFlagProps) {
  const [isEnabled, loading, error] = useRemoteConfig<boolean>(flagKey, false);

  if (loading) {
    return loadingFallback;
  }
  
  if (error) {
    console.error(`Error loading feature flag ${flagKey}:`, error);
    return fallback;
  }

  return isEnabled ? children : fallback;
}
