import React, { Suspense } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card'
import { LoadingSpinner } from '../ui/loading-spinner'
import { ErrorBoundary } from '../AgentDashboard'
import { useSettings } from '../../contexts/SettingsContext'
import { Switch } from '../ui/switch'
import { Button } from '../ui/button'
import { Slider } from '../ui/slider'
import { Label } from '../ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Sun, Moon, RotateCcw } from 'lucide-react'
import type {
  LLMSettings,
  MemorySettings,
  PerformanceSettings,
  SecuritySettings,
} from '../../types/settings'

function SettingsContent() {
  const { settings, updateSettings, resetSettings } = useSettings()

  const handleThemeChange = () => {
    updateSettings({ theme: settings.theme === 'light' ? 'dark' : 'light' })
  }

  const handleFontSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateSettings({ fontSize: e.target.value as 'small' | 'medium' | 'large' })
  }

  const handleNotificationsChange = () => {
    updateSettings({ notifications: !settings.notifications })
  }

  const handleLLMSettingChange = (
    key: keyof LLMSettings,
    value: LLMSettings[keyof LLMSettings]
  ) => {
    updateSettings({
      llm: {
        ...settings.llm,
        [key]: value,
      },
    })
  }

  const handleMemorySettingChange = (
    key: keyof MemorySettings,
    value: MemorySettings[keyof MemorySettings]
  ) => {
    updateSettings({
      memory: {
        ...settings.memory,
        [key]: value,
      },
    })
  }

  const handlePerformanceSettingChange = (
    key: keyof PerformanceSettings,
    value: PerformanceSettings[keyof PerformanceSettings]
  ) => {
    updateSettings({
      performance: {
        ...settings.performance,
        [key]: value,
      },
    })
  }

  const handleSecuritySettingChange = (
    key: keyof SecuritySettings,
    value: SecuritySettings[keyof SecuritySettings]
  ) => {
    updateSettings({
      security: {
        ...settings.security,
        [key]: value,
      },
    })
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="model">Model</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="memory">Memory</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
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
                <select
                  value={settings.fontSize}
                  onChange={handleFontSizeChange}
                  className="h-10 w-32 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm"
                  aria-label="Select font size"
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
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
        </TabsContent>

        <TabsContent value="model">
          <Card>
            <CardHeader>
              <CardTitle>Language Model Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Default Chat Model</Label>
                <select
                  value={settings.llm.defaultModel}
                  onChange={e => handleLLMSettingChange('defaultModel', e.target.value)}
                  className="h-10 w-64 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm"
                  aria-label="Select default chat model"
                >
                  <option value="granite3.1-dense:2b">Granite 3.1 Dense 2B (Default)</option>
                  <option value="llama-3.3-70b-versatile">Llama 3.3 70B</option>
                  <option value="gpt-4o-2024-11-06">GPT-4o</option>
                  <option value="gpt-4o-mini-2024-07-18">GPT-4o Mini</option>
                  <option value="o1-2024-12-01">O1</option>
                  <option value="o1-mini-2024-09-15">O1 Mini</option>
                  <option value="Qwen/QwQ-32B-Preview">Qwen QwQ 32B</option>
                  <option value="claude-3-5-sonnet-v2@20241022">Claude 3.5 Sonnet</option>
                  <option value="claude-3.5-haiku@20241022">Claude 3.5 Haiku</option>
                  <option value="llama-3.1-sonar-small-128k-online">Sonar Small</option>
                  <option value="llama-3.1-sonar-large-128k-online">Sonar Large</option>
                  <option value="llama-3.1-sonar-huge-128k-online">Sonar Huge</option>
                </select>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Temperature</Label>
                  <span className="text-muted-foreground text-sm">{settings.llm.temperature}</span>
                </div>
                <Slider
                  min={0}
                  max={2}
                  step={0.1}
                  value={[settings.llm.temperature]}
                  onValueChange={([value]) => handleLLMSettingChange('temperature', value)}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Top P</Label>
                  <span className="text-muted-foreground text-sm">{settings.llm.topP}</span>
                </div>
                <Slider
                  min={0}
                  max={1}
                  step={0.05}
                  value={[settings.llm.topP]}
                  onValueChange={([value]) => handleLLMSettingChange('topP', value)}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Max Tokens</Label>
                  <span className="text-muted-foreground text-sm">{settings.llm.maxTokens}</span>
                </div>
                <Slider
                  min={256}
                  max={32768}
                  step={256}
                  value={[settings.llm.maxTokens]}
                  onValueChange={([value]) => handleLLMSettingChange('maxTokens', value)}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Context Length</Label>
                  <span className="text-muted-foreground text-sm">
                    {settings.llm.contextLength}
                  </span>
                </div>
                <Slider
                  min={1024}
                  max={32768}
                  step={1024}
                  value={[settings.llm.contextLength]}
                  onValueChange={([value]) => handleLLMSettingChange('contextLength', value)}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Frequency Penalty</Label>
                  <span className="text-muted-foreground text-sm">
                    {settings.llm.frequencyPenalty}
                  </span>
                </div>
                <Slider
                  min={0}
                  max={2}
                  step={0.1}
                  value={[settings.llm.frequencyPenalty]}
                  onValueChange={([value]) => handleLLMSettingChange('frequencyPenalty', value)}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Presence Penalty</Label>
                  <span className="text-muted-foreground text-sm">
                    {settings.llm.presencePenalty}
                  </span>
                </div>
                <Slider
                  min={0}
                  max={2}
                  step={0.1}
                  value={[settings.llm.presencePenalty]}
                  onValueChange={([value]) => handleLLMSettingChange('presencePenalty', value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>Stream Responses</Label>
                <Switch
                  checked={settings.llm.streamResponses}
                  onCheckedChange={checked => handleLLMSettingChange('streamResponses', checked)}
                  aria-label="Toggle response streaming"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Performance Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Batch Size</Label>
                <select
                  value={settings.performance.batchSize.toString()}
                  onChange={e =>
                    handlePerformanceSettingChange('batchSize', parseInt(e.target.value))
                  }
                  className="h-10 w-32 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm"
                  aria-label="Select batch size"
                >
                  <option value="8">8</option>
                  <option value="16">16</option>
                  <option value="32">32</option>
                  <option value="64">64</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <Label>Cache Duration (seconds)</Label>
                <select
                  value={settings.performance.cacheDuration.toString()}
                  onChange={e =>
                    handlePerformanceSettingChange('cacheDuration', parseInt(e.target.value))
                  }
                  className="h-10 w-32 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm"
                  aria-label="Select cache duration"
                >
                  <option value="1800">30 minutes</option>
                  <option value="3600">1 hour</option>
                  <option value="7200">2 hours</option>
                  <option value="14400">4 hours</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <Label>Cache Enabled</Label>
                <Switch
                  checked={settings.performance.cacheEnabled}
                  onCheckedChange={checked =>
                    handlePerformanceSettingChange('cacheEnabled', checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>Debug Mode</Label>
                <Switch
                  checked={settings.performance.debugMode}
                  onCheckedChange={checked => handlePerformanceSettingChange('debugMode', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>Log Level</Label>
                <select
                  value={settings.performance.logLevel}
                  onChange={e =>
                    handlePerformanceSettingChange(
                      'logLevel',
                      e.target.value as PerformanceSettings['logLevel']
                    )
                  }
                  className="h-10 w-32 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm"
                  aria-label="Select log level"
                >
                  <option value="debug">Debug</option>
                  <option value="info">Info</option>
                  <option value="warn">Warning</option>
                  <option value="error">Error</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="memory">
          <Card>
            <CardHeader>
              <CardTitle>Memory Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Max Items</Label>
                <select
                  value={settings.memory.maxItems.toString()}
                  onChange={e => handleMemorySettingChange('maxItems', parseInt(e.target.value))}
                  className="h-10 w-32 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm"
                  aria-label="Select maximum items"
                >
                  <option value="500">500</option>
                  <option value="1000">1,000</option>
                  <option value="2000">2,000</option>
                  <option value="5000">5,000</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <Label>Retention Days</Label>
                <select
                  value={settings.memory.retentionDays.toString()}
                  onChange={e =>
                    handleMemorySettingChange('retentionDays', parseInt(e.target.value))
                  }
                  className="h-10 w-32 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm"
                  aria-label="Select retention period"
                >
                  <option value="7">7 days</option>
                  <option value="14">14 days</option>
                  <option value="30">30 days</option>
                  <option value="90">90 days</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <Label>Vector Search</Label>
                <Switch
                  checked={settings.memory.vectorSearch}
                  onCheckedChange={checked => handleMemorySettingChange('vectorSearch', checked)}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Similarity Threshold</Label>
                  <span className="text-muted-foreground text-sm">
                    {settings.memory.similarityThreshold}
                  </span>
                </div>
                <Slider
                  min={0.5}
                  max={1}
                  step={0.05}
                  value={[settings.memory.similarityThreshold]}
                  onValueChange={([value]) =>
                    handleMemorySettingChange('similarityThreshold', value)
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>API Key Rotation (days)</Label>
                <select
                  value={settings.security.apiKeyRotation.toString()}
                  onChange={e =>
                    handleSecuritySettingChange('apiKeyRotation', parseInt(e.target.value))
                  }
                  className="h-10 w-32 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm"
                  aria-label="Select API key rotation period"
                >
                  <option value="7">7 days</option>
                  <option value="14">14 days</option>
                  <option value="30">30 days</option>
                  <option value="90">90 days</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <Label>Sandbox Mode</Label>
                <Switch
                  checked={settings.security.sandboxMode}
                  onCheckedChange={checked => handleSecuritySettingChange('sandboxMode', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>Content Filtering</Label>
                <Switch
                  checked={settings.security.contentFiltering}
                  onCheckedChange={checked =>
                    handleSecuritySettingChange('contentFiltering', checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>Max Tokens Per Request</Label>
                <select
                  value={settings.security.maxTokensPerRequest.toString()}
                  onChange={e =>
                    handleSecuritySettingChange('maxTokensPerRequest', parseInt(e.target.value))
                  }
                  className="h-10 w-32 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm"
                  aria-label="Select maximum tokens per request"
                >
                  <option value="2048">2,048</option>
                  <option value="4096">4,096</option>
                  <option value="8192">8,192</option>
                  <option value="16384">16,384</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end space-x-4">
        <Button variant="outline" onClick={resetSettings}>
          <RotateCcw className="mr-2 h-4 w-4" />
          Reset
        </Button>
      </div>
    </div>
  )
}

export function SettingsPanel() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingSpinner />}>
        <SettingsContent />
      </Suspense>
    </ErrorBoundary>
  )
}
