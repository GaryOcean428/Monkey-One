import { useState, useEffect } from 'react';
import { getValue, fetchAndActivate } from 'firebase/remote-config';
import { remoteConfig } from '../config';

type RemoteConfigValue = string | number | boolean | object;

export function useRemoteConfig<T extends RemoteConfigValue>(
  key: string,
  defaultValue: T
): [T, boolean, Error | null] {
  const [value, setValue] = useState<T>(defaultValue);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        setLoading(true);
        await fetchAndActivate(remoteConfig);
        const configValue = getValue(remoteConfig, key);
        
        // Parse the value based on the type
        let parsedValue: T;
        try {
          parsedValue = JSON.parse(configValue.asString()) as T;
        } catch {
          // If JSON parsing fails, try other types
          if (typeof defaultValue === 'boolean') {
            parsedValue = configValue.asBoolean() as T;
          } else if (typeof defaultValue === 'number') {
            parsedValue = configValue.asNumber() as T;
          } else {
            parsedValue = configValue.asString() as T;
          }
        }
        
        setValue(parsedValue);
        setError(null);
      } catch (err) {
        console.error(`Error fetching remote config for key ${key}:`, err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, [key, defaultValue]);

  return [value, loading, error];
}
