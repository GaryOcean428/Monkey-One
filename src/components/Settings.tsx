import React from 'react'
import { useSettings } from '../contexts/SettingsContext'

export function Settings() {
  const { settings, updateSettings } = useSettings()

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="mb-6 text-2xl font-bold">Settings</h1>

      <div className="space-y-6">
        <div>
          <h2 className="mb-4 text-lg font-semibold">Theme</h2>
          <select
            value={settings.theme}
            onChange={e => updateSettings({ theme: e.target.value as 'light' | 'dark' })}
            className="w-full rounded-md border p-2"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>

        <div>
          <h2 className="mb-4 text-lg font-semibold">Font Size</h2>
          <select
            value={settings.fontSize}
            onChange={e =>
              updateSettings({ fontSize: e.target.value as 'small' | 'medium' | 'large' })
            }
            className="w-full rounded-md border p-2"
          >
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </div>

        <div>
          <h2 className="mb-4 text-lg font-semibold">Notifications</h2>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={settings.notifications}
              onChange={e => updateSettings({ notifications: e.target.checked })}
              className="rounded"
            />
            <span>Enable notifications</span>
          </label>
        </div>

        {settings.llm && (
          <div>
            <h2 className="mb-4 text-lg font-semibold">LLM Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Model</label>
                <input
                  type="text"
                  value={settings.llm.defaultModel}
                  onChange={e =>
                    updateSettings({
                      llm: { ...settings.llm, defaultModel: e.target.value },
                    })
                  }
                  className="w-full rounded-md border p-2"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Temperature</label>
                <input
                  type="number"
                  min="0"
                  max="1"
                  step="0.1"
                  value={settings.llm.temperature}
                  onChange={e =>
                    updateSettings({
                      llm: { ...settings.llm, temperature: parseFloat(e.target.value) },
                    })
                  }
                  className="w-full rounded-md border p-2"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Max Tokens</label>
                <input
                  type="number"
                  min="1"
                  value={settings.llm.maxTokens}
                  onChange={e =>
                    updateSettings({
                      llm: { ...settings.llm, maxTokens: parseInt(e.target.value) },
                    })
                  }
                  className="w-full rounded-md border p-2"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
