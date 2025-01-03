import { useFeatureFlag } from '../../hooks/useFeatureFlag'

// Feature flag keys
const DARK_MODE_ENABLED = 'dark_mode_enabled'
const MAINTENANCE_MODE = 'maintenance_mode'
const BETA_FEATURES_ENABLED = 'beta_features_enabled'
const API_CONFIG = 'api_config'

export function FeatureFlagExample() {
  const [isDarkMode, darkModeLoading, darkModeError] = useFeatureFlag(DARK_MODE_ENABLED, false)
  const [isMaintenanceMode, maintenanceLoading, maintenanceError] = useFeatureFlag(
    MAINTENANCE_MODE,
    false
  )
  const [betaEnabled, betaLoading, betaError] = useFeatureFlag(BETA_FEATURES_ENABLED, false)
  const [apiConfigEnabled, apiConfigLoading, apiConfigError] = useFeatureFlag(API_CONFIG, false)

  // Example of handling multiple loading states
  const isLoading = darkModeLoading || maintenanceLoading || betaLoading || apiConfigLoading

  // Example of handling multiple errors
  const errors = [
    { key: 'Dark Mode', error: darkModeError },
    { key: 'Maintenance', error: maintenanceError },
    { key: 'Beta Features', error: betaError },
    { key: 'API Config', error: apiConfigError },
  ].filter(({ error }) => error !== null)

  if (isLoading) {
    return <div>Loading configuration...</div>
  }

  if (isMaintenanceMode) {
    return <div>Site is under maintenance</div>
  }

  return (
    <div className={isDarkMode ? 'dark' : 'light'}>
      <h1>Feature Flags Example</h1>

      <div className="feature-status">
        <h2>Feature Status</h2>
        <ul>
          <li>Dark Mode: {isDarkMode ? 'Enabled' : 'Disabled'}</li>
          <li>Beta Features: {betaEnabled ? 'Enabled' : 'Disabled'}</li>
          <li>API Config: {apiConfigEnabled ? 'Enabled' : 'Disabled'}</li>
        </ul>
      </div>

      {betaEnabled && (
        <div className="beta-features">
          <h2>Beta Features</h2>
          <p>You have access to beta features!</p>
          {/* Beta feature content */}
        </div>
      )}

      {errors.length > 0 && (
        <div className="errors">
          <h2>Configuration Errors</h2>
          <ul>
            {errors.map(({ key, error }) => (
              <li key={key} className="error">
                {key}: {error?.message}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
