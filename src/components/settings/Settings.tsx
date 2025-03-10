import React from 'react'
import { Card } from '../ui/Card'
import { useSettings } from '../../hooks/useSettings'
import { Button } from '../ui/Button'
import { Switch } from '../ui/Switch'
import { Select } from '../ui/Select'

export interface SettingsProps {
  className?: string
}

const Settings: React.FC<SettingsProps> = ({ className = '' }) => {
  const { settings, updateSettings, isLoading } = useSettings()

  const handleThemeChange = (theme: string) => {
    updateSettings({ theme })
  }

  const handleNotificationsChange = (enabled: boolean) => {
    updateSettings({ notifications: enabled })
  }

  const handleLanguageChange = (language: string) => {
    updateSettings({ language })
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className={`p-6 space-y-6 ${className}`}>
      <h1 className="text-2xl font-bold">Settings</h1>

      <Card className="p-4 space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-4">Appearance</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Theme</span>
              <Select
                value={settings.theme}
                onChange={handleThemeChange}
                options={[
                  { label: 'Light', value: 'light' },
                  { label: 'Dark', value: 'dark' },
                  { label: 'System', value: 'system' }
                ]}
              />
            </div>
            <div className="flex items-center justify-between">
              <span>Language</span>
              <Select
                value={settings.language}
                onChange={handleLanguageChange}
                options={[
                  { label: 'English', value: 'en' },
                  { label: 'Spanish', value: 'es' },
                  { label: 'French', value: 'fr' }
                ]}
              />
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">Notifications</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Enable Notifications</span>
              <Switch
                checked={settings.notifications}
                onCheckedChange={handleNotificationsChange}
              />
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">Privacy</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Data Collection</span>
              <Switch
                checked={settings.dataCollection}
                onCheckedChange={(enabled) =>
                  updateSettings({ dataCollection: enabled })
                }
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t">
          <Button
            onClick={() => updateSettings(settings)}
            variant="primary"
            className="w-full"
          >
            Save Changes
          </Button>
        </div>
      </Card>
    </div>
  )
}

export default Settings
