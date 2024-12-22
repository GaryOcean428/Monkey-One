import { useCallback } from 'react';
import { useSettingsStore } from '@/store/settingsStore';
import type { Settings } from '@/types';

export function useSettings() {
  const { settings, updateSettings, resetSettings } = useSettingsStore();

  const handleUpdateSettings = useCallback((newSettings: Partial<Settings>) => {
    updateSettings(newSettings);

    // Apply theme changes immediately
    if (newSettings.theme) {
      document.documentElement.classList.toggle('dark', newSettings.theme === 'dark');
    }
  }, [updateSettings]);

  return {
    settings,
    updateSettings: handleUpdateSettings,
    resetSettings
  };
}