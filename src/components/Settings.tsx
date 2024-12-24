import React from 'react';
import { useSettings } from '../context/SettingsContext';

export function Settings() {
  const { settings, updateSettings } = useSettings();

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-4">Theme</h2>
          <select
            value={settings.theme}
            onChange={(e) => updateSettings({ theme: e.target.value as 'light' | 'dark' })}
            className="w-full p-2 border rounded-md"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">Font Size</h2>
          <select
            value={settings.fontSize}
            onChange={(e) => updateSettings({ fontSize: e.target.value as 'small' | 'medium' | 'large' })}
            className="w-full p-2 border rounded-md"
          >
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">Notifications</h2>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={settings.notifications}
              onChange={(e) => updateSettings({ notifications: e.target.checked })}
              className="rounded"
            />
            <span>Enable notifications</span>
          </label>
        </div>

        {settings.llm && (
          <div>
            <h2 className="text-lg font-semibold mb-4">LLM Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Model</label>
                <input
                  type="text"
                  value={settings.llm.defaultModel}
                  onChange={(e) => updateSettings({
                    llm: { ...settings.llm, defaultModel: e.target.value }
                  })}
                  className="w-full p-2 border rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Temperature</label>
                <input
                  type="number"
                  min="0"
                  max="1"
                  step="0.1"
                  value={settings.llm.temperature}
                  onChange={(e) => updateSettings({
                    llm: { ...settings.llm, temperature: parseFloat(e.target.value) }
                  })}
                  className="w-full p-2 border rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Max Tokens</label>
                <input
                  type="number"
                  min="1"
                  value={settings.llm.maxTokens}
                  onChange={(e) => updateSettings({
                    llm: { ...settings.llm, maxTokens: parseInt(e.target.value) }
                  })}
                  className="w-full p-2 border rounded-md"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
