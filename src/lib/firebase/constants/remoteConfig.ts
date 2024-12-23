import { createParameter } from '../hooks/useRemoteConfig';

// App Settings
export const APP_VERSION = createParameter(
  'app_version',
  '1.0.0',
  'string',
  'Current app version'
);

export const MAINTENANCE_MODE = createParameter(
  'maintenance_mode',
  false,
  'boolean',
  'Toggle maintenance mode'
);

// Feature Flags
export const DARK_MODE_ENABLED = createParameter(
  'enable_dark_mode',
  true,
  'boolean',
  'Enable dark mode theme'
);

export const NOTIFICATIONS_ENABLED = createParameter(
  'enable_notifications',
  true,
  'boolean',
  'Enable push notifications'
);

export const BETA_FEATURES_ENABLED = createParameter(
  'enable_beta_features',
  false,
  'boolean',
  'Enable beta features',
  [
    {
      name: 'Beta Users',
      value: true,
      tagColor: '#4CAF50'
    }
  ]
);

// UI Configuration
export const PRIMARY_COLOR = createParameter(
  'primary_color',
  '#007AFF',
  'string',
  'Primary theme color'
);

export const FONT_SIZE = createParameter(
  'font_size',
  '16px',
  'string',
  'Base font size'
);

// API Configuration
export const API_ENDPOINT = createParameter(
  'api_endpoint',
  import.meta.env.VITE_API_ENDPOINT || 'https://api.default.com',
  'string',
  'API endpoint URL'
);

export const API_TIMEOUT = createParameter(
  'api_timeout',
  30000,
  'number',
  'API request timeout in milliseconds'
);

// Performance Settings
export const CACHE_TTL = createParameter(
  'cache_ttl',
  3600,
  'number',
  'Cache time-to-live in seconds'
);

export const PREFETCH_ENABLED = createParameter(
  'prefetch_enabled',
  true,
  'boolean',
  'Enable data prefetching'
);
