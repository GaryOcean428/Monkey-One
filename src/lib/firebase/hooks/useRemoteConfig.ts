import { useState, useEffect, useCallback } from 'react';
import {
  getValue,
  fetchAndActivate,
  type RemoteConfig as FirebaseRemoteConfig,
  getRemoteConfig
} from 'firebase/remote-config';
import { app } from '../config';

// Type definitions for parameter conditions
interface ParameterCondition {
  name: string;
  value: string | number | boolean;
  tagColor?: string;
}

// Remote config parameter value types
type RemoteConfigValue = string | number | boolean;
type ParameterValueType = 'string' | 'number' | 'boolean' | 'json';

interface RemoteConfigParameter<T extends RemoteConfigValue> {
  key: string;
  defaultValue: T;
  valueType: ParameterValueType;
  description?: string;
  conditions?: ParameterCondition[];
}

// Cache for remote config instances
const configCache = new Map<string, FirebaseRemoteConfig>();

// Initialize remote config with settings
function getOrCreateRemoteConfig(): FirebaseRemoteConfig {
  const cacheKey = 'default';
  if (configCache.has(cacheKey)) {
    return configCache.get(cacheKey)!;
  }

  const remoteConfig = getRemoteConfig(app);
  remoteConfig.settings = {
    minimumFetchIntervalMillis: import.meta.env.PROD ? 3600000 : 0,
    fetchTimeoutMillis: 60000
  };

  remoteConfig.defaultConfig = {
    // App settings
    app_version: '1.0.0',
    maintenance_mode: false,
    maintenance_message: 'We are currently performing maintenance. Please try again later.',
    
    // Feature flags
    enable_dark_mode: true,
    enable_notifications: true,
    enable_beta_features: false,
    
    // UI configurations
    primary_color: '#007AFF',
    secondary_color: '#5856D6',
    font_size: '16px',
    
    // API configurations
    api_endpoint: import.meta.env.VITE_API_ENDPOINT || 'https://api.default.com',
    api_timeout: '30000',
    api_retry_count: '3',
    
    // Content configurations
    welcome_message: 'Welcome to our app!',
    help_center_url: 'https://help.example.com',
    terms_url: 'https://terms.example.com',
    
    // Performance settings
    cache_ttl: '3600',
    prefetch_enabled: true,
    analytics_sample_rate: '100'
  };

  configCache.set(cacheKey, remoteConfig);
  return remoteConfig;
}

// Parse remote config value based on type
function parseConfigValue<T extends RemoteConfigValue>(
  value: string,
  valueType: ParameterValueType,
  defaultValue: T
): T {
  try {
    switch (valueType) {
      case 'boolean':
        return (value.toLowerCase() === 'true') as T;
      case 'number':
        return Number(value) as T;
      case 'json':
        return JSON.parse(value) as T;
      default:
        return value as T;
    }
  } catch (error) {
    console.warn(`Error parsing remote config value: ${error}. Using default value.`);
    return defaultValue;
  }
}

// Custom hook for using remote config parameters
export function useRemoteConfig<T extends RemoteConfigValue>({
  key,
  defaultValue,
  valueType,
  description
}: RemoteConfigParameter<T>): [T, boolean, Error | null, () => Promise<void>] {
  const [value, setValue] = useState<T>(defaultValue);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchConfig = useCallback(async () => {
    try {
      setLoading(true);
      const remoteConfig = getOrCreateRemoteConfig();
      await fetchAndActivate(remoteConfig);
      
      const configValue = getValue(remoteConfig, key);
      const parsedValue = parseConfigValue(configValue.asString(), valueType, defaultValue);
      
      setValue(parsedValue);
      setError(null);
      
      // Log for debugging in development
      if (import.meta.env.DEV) {
        console.debug(`Remote config value for ${key}:`, {
          value: parsedValue,
          type: valueType,
          description
        });
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error(`Error fetching remote config for ${key}:`, error);
      setError(error);
      setValue(defaultValue); // Fallback to default value on error
    } finally {
      setLoading(false);
    }
  }, [key, defaultValue, valueType, description]);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  return [value, loading, error, fetchConfig];
}

// Export helper functions for parameter creation
export function createParameter<T extends RemoteConfigValue>(
  key: string,
  defaultValue: T,
  valueType: ParameterValueType,
  description?: string,
  conditions?: ParameterCondition[]
): RemoteConfigParameter<T> {
  return {
    key,
    defaultValue,
    valueType,
    description,
    conditions
  };
}
