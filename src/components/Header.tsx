import React from 'react'
import { Sun, Moon } from 'lucide-react'
import { useSettings } from '../contexts/SettingsContext'
import { Button } from './ui/button'

export function Header() {
  const { settings, updateSettings } = useSettings()

  const toggleTheme = () => {
    updateSettings({ theme: settings.theme === 'light' ? 'dark' : 'light' })
  }

  return (
    <header className="bg-background flex items-center justify-between border-b px-6 py-4">
      <h1 className="text-2xl font-bold">Monkey One</h1>
      <Button variant="ghost" size="sm" onClick={toggleTheme} className="gap-2">
        {settings.theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
      </Button>
    </header>
  )
}
