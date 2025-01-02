export interface Settings {
  theme: 'light' | 'dark' | 'system';
  notifications: boolean;
  language: 'en' | 'es' | 'fr';
  dataCollection: boolean;
  fontSize: 'sm' | 'md' | 'lg';
  colorScheme: string;
  autoSave: boolean;
  telemetry: boolean;
}

export interface UseSettingsReturn {
  settings: Settings;
  isLoading: boolean;
  error: Error | null;
  updateSettings: (newSettings: Partial<Settings>) => Promise<void>;
  resetSettings: () => Promise<void>;
}

export const defaultSettings: Settings = {
  theme: 'system',
  notifications: true,
  language: 'en',
  dataCollection: false,
  fontSize: 'md',
  colorScheme: 'blue',
  autoSave: true,
  telemetry: false
}