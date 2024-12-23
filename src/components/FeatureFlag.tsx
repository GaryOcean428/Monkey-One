import { useRemoteConfig } from '@/lib/firebase/hooks/useRemoteConfig';

interface FeatureFlagProps {
  flagKey: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function FeatureFlag({ flagKey, children, fallback = null }: FeatureFlagProps) {
  const [isEnabled, loading, error] = useRemoteConfig<boolean>(flagKey, false);

  if (loading) return null;
  if (error) {
    console.error(`Error loading feature flag ${flagKey}:`, error);
    return fallback;
  }

  return isEnabled ? children : fallback;
}
