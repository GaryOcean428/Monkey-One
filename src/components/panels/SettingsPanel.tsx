import React, { Suspense } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { LoadingSpinner } from '../ui/loading-spinner';
import { ToolhouseErrorBoundary } from '../ErrorBoundary/ToolhouseErrorBoundary';
import { useSettings } from '../../context/SettingsContext';
import { Switch } from '../ui/switch';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select';
import { Label } from '../ui/label';
import { Sun, Moon, Save, RotateCcw } from 'lucide-react';

function SettingsContent() {
  const { settings, updateSettings, resetSettings } = useSettings();

  const handleThemeChange = () => {
    updateSettings({ theme: settings.theme === 'light' ? 'dark' : 'light' });
  };

  const handleFontSizeChange = (value: string) => {
    updateSettings({ fontSize: value as 'small' | 'medium' | 'large' });
  };

  const handleNotificationsChange = () => {
    updateSettings({ notifications: !settings.notifications });
  };

  const handleLLMSettingChange = (key: keyof typeof settings.llm, value: any) => {
    updateSettings({
      llm: {
        ...settings.llm,
        [key]: value
      }
    });
  };

  const handleAgentSettingChange = (key: keyof typeof settings.agents, value: any) => {
    updateSettings({
      agents: {
        ...settings.agents,
        [key]: value
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Theme</Label>
            <div className="flex items-center gap-2">
              <Sun className="h-4 w-4" />
              <Switch
                checked={settings.theme === 'dark'}
                onCheckedChange={handleThemeChange}
                aria-label="Toggle theme"
              />
              <Moon className="h-4 w-4" />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Label>Font Size</Label>
            <Select value={settings.fontSize} onValueChange={handleFontSizeChange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Small</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="large">Large</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label>Notifications</Label>
            <Switch
              checked={settings.notifications}
              onCheckedChange={handleNotificationsChange}
              aria-label="Toggle notifications"
            />
          </div>
        </CardContent>
      </Card>

      {/* LLM Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Language Model Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Default Model</Label>
            <Select 
              value={settings.llm.defaultModel}
              onValueChange={(value) => handleLLMSettingChange('defaultModel', value)}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gpt-4-o1">GPT-4-O1</SelectItem>
                <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                <SelectItem value="claude-2">Claude 2</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label>Temperature</Label>
            <Input
              type="number"
              min="0"
              max="2"
              step="0.1"
              value={settings.llm.temperature}
              onChange={(e) => handleLLMSettingChange('temperature', parseFloat(e.target.value))}
              className="w-32"
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>Max Tokens</Label>
            <Input
              type="number"
              min="1"
              max="32000"
              value={settings.llm.maxTokens}
              onChange={(e) => handleLLMSettingChange('maxTokens', parseInt(e.target.value))}
              className="w-32"
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>Stream Responses</Label>
            <Switch
              checked={settings.llm.streamResponses}
              onCheckedChange={(checked) => handleLLMSettingChange('streamResponses', checked)}
              aria-label="Toggle response streaming"
            />
          </div>
        </CardContent>
      </Card>

      {/* Agent Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Agent Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Max Concurrent Tasks</Label>
            <Input
              type="number"
              min="1"
              max="10"
              value={settings.agents.maxConcurrentTasks}
              onChange={(e) => handleAgentSettingChange('maxConcurrentTasks', parseInt(e.target.value))}
              className="w-32"
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>Task Timeout (ms)</Label>
            <Input
              type="number"
              min="1000"
              step="1000"
              value={settings.agents.taskTimeout}
              onChange={(e) => handleAgentSettingChange('taskTimeout', parseInt(e.target.value))}
              className="w-32"
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>Auto Delegation</Label>
            <Switch
              checked={settings.agents.autoDelegation}
              onCheckedChange={(checked) => handleAgentSettingChange('autoDelegation', checked)}
              aria-label="Toggle auto delegation"
            />
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4">
        <Button
          variant="outline"
          onClick={resetSettings}
          className="flex items-center gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Reset to Defaults
        </Button>
      </div>
    </div>
  );
}

export default function SettingsPanel() {
  return (
    <div 
      className="h-full p-4 bg-background overflow-y-auto"
      role="region"
      aria-label="Settings Management"
    >
      <div className="max-w-2xl mx-auto">
        <h2 className="text-lg font-semibold mb-4">Settings</h2>
        <ToolhouseErrorBoundary>
          <Suspense fallback={<LoadingSpinner size="lg" />}>
            <SettingsContent />
          </Suspense>
        </ToolhouseErrorBoundary>
      </div>
    </div>
  );
}
