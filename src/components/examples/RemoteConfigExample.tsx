import { useEffect } from 'react';
import { useRemoteConfig } from '../../lib/firebase/hooks/useRemoteConfig';
import {
  DARK_MODE_ENABLED,
  API_ENDPOINT,
  MAINTENANCE_MODE,
  BETA_FEATURES_ENABLED
} from '../../lib/firebase/constants/remoteConfig';

export function RemoteConfigExample() {
  // Use multiple remote config parameters
  const [isDarkMode, darkModeLoading] = useRemoteConfig(DARK_MODE_ENABLED);
  const [apiUrl, apiLoading] = useRemoteConfig(API_ENDPOINT);
  const [isMaintenanceMode, maintenanceLoading] = useRemoteConfig(MAINTENANCE_MODE);
  const [betaEnabled, betaLoading, betaError, refetchBeta] = useRemoteConfig(BETA_FEATURES_ENABLED);

  // Example of manual refetch
  useEffect(() => {
    const interval = setInterval(() => {
      refetchBeta(); // Refetch beta features status periodically
    }, 5 * 60 * 1000); // Every 5 minutes

    return () => clearInterval(interval);
  }, [refetchBeta]);

  if (darkModeLoading || apiLoading || maintenanceLoading || betaLoading) {
    return <div>Loading configuration...</div>;
  }

  if (isMaintenanceMode) {
    return <div>Site is under maintenance</div>;
  }

  return (
    <div className={isDarkMode ? 'dark' : 'light'}>
      <h1>Remote Config Example</h1>
      <p>API Endpoint: {apiUrl}</p>
      {betaEnabled && (
        <div className="beta-features">
          <h2>Beta Features Enabled!</h2>
          {/* Beta feature content */}
        </div>
      )}
      {betaError && (
        <div className="error">
          Error loading beta features status: {betaError.message}
        </div>
      )}
    </div>
  );
}
