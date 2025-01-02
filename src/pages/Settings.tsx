import React from 'react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'

export const Settings: React.FC = () => {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      
      <div className="space-y-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">General Settings</h2>
          <div className="space-y-2">
            <Label htmlFor="theme">Theme</Label>
            <select 
              id="theme" 
              name="theme"
              className="w-full p-2 border rounded"
              aria-label="Select theme"
              title="Choose your preferred theme"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">API Configuration</h2>
          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key</Label>
            <Input 
              type="password" 
              id="apiKey" 
              name="apiKey"
              placeholder="Enter your API key" 
              aria-label="API key input"
              title="Enter your API key"
            />
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Notifications</h2>
          <div className="flex items-center space-x-2">
            <input 
              type="checkbox" 
              id="emailNotifications"
              name="emailNotifications"
              aria-label="Enable email notifications"
            />
            <Label htmlFor="emailNotifications">Enable email notifications</Label>
          </div>
        </div>

        <Button type="submit" className="mt-4">Save Changes</Button>
      </div>
    </div>
  )
}
