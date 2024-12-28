import React, { Suspense } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { LoadingSpinner } from '../ui/loading-spinner';
import { ToolhouseErrorBoundary } from '../ErrorBoundary/ToolhouseErrorBoundary';
import { useSettings } from '../../contexts/SettingsContext';
import { Switch } from '../ui/switch';
import { Button } from '../ui/button';
import { Slider } from '../ui/slider';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
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

  const handleMemorySettingChange = (key: keyof typeof settings.memory, value: any) => {
    updateSettings({
      memory: {
        ...settings.memory,
        [key]: value
      }
    });
  };

  const handlePerformanceSettingChange = (key: keyof typeof settings.performance, value: any) => {
    updateSettings({
      performance: {
        ...settings.performance,
        [key]: value
      }
    });
  };

  const handleSecuritySettingChange = (key: keyof typeof settings.security, value: any) => {
    updateSettings({
      security: {
        ...settings.security,
        [key]: value
      }
    });
  };

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
        </TabsContent>

        <TabsContent value="model">
          <Card>
            <CardHeader>
              <CardTitle>Language Model Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Default Chat Model</Label>
                <Select 
                  value={settings.llm.defaultModel}
                  onValueChange={(value) => handleLLMSettingChange('defaultModel', value)}
                >
                  <SelectTrigger className="w-64">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="granite3.1-dense:2b">Granite 3.1 Dense 2B (Default)</SelectItem>
                    <SelectItem value="llama-3.3-70b-versatile">Llama 3.3 70B</SelectItem>
                    <SelectItem value="gpt-4o-2024-11-06">GPT-4o</SelectItem>
                    <SelectItem value="gpt-4o-mini-2024-07-18">GPT-4o Mini</SelectItem>
                    <SelectItem value="o1-2024-12-01">O1</SelectItem>
                    <SelectItem value="o1-mini-2024-09-15">O1 Mini</SelectItem>
                    <SelectItem value="Qwen/QwQ-32B-Preview">Qwen QwQ 32B</SelectItem>
                    <SelectItem value="claude-3-5-sonnet-v2@20241022">Claude 3.5 Sonnet</SelectItem>
                    <SelectItem value="claude-3.5-haiku@20241022">Claude 3.5 Haiku</SelectItem>
                    <SelectItem value="llama-3.1-sonar-small-128k-online">Sonar Small</SelectItem>
                    <SelectItem value="llama-3.1-sonar-large-128k-online">Sonar Large</SelectItem>
                    <SelectItem value="llama-3.1-sonar-huge-128k-online">Sonar Huge</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Temperature</Label>
                  <span className="text-sm text-muted-foreground">{settings.llm.temperature}</span>
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
                  <span className="text-sm text-muted-foreground">{settings.llm.topP}</span>
                </div>
                <Slider
                  min={0}
                  max={1}
                  step={0.05}
                  value={[settings.llm.topP]}
                  onValueChange={([value]) => handleLLMSettingChange('topP', value)}
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
        </TabsContent>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Performance Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Batch Size</Label>
                <Select
                  value={settings.performance.batchSize.toString()}
                  onValueChange={(value) => handlePerformanceSettingChange('batchSize', parseInt(value))}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="8">8</SelectItem>
                    <SelectItem value="16">16</SelectItem>
                    <SelectItem value="32">32</SelectItem>
                    <SelectItem value="64">64</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label>Cache Duration (seconds)</Label>
                <Select
                  value={settings.performance.cacheDuration.toString()}
                  onValueChange={(value) => handlePerformanceSettingChange('cacheDuration', parseInt(value))}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1800">30 minutes</SelectItem>
                    <SelectItem value="3600">1 hour</SelectItem>
                    <SelectItem value="7200">2 hours</SelectItem>
                    <SelectItem value="14400">4 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label>Cache Enabled</Label>
                <Switch
                  checked={settings.performance.cacheEnabled}
                  onCheckedChange={(checked) => handlePerformanceSettingChange('cacheEnabled', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>Debug Mode</Label>
                <Switch
                  checked={settings.performance.debugMode}
                  onCheckedChange={(checked) => handlePerformanceSettingChange('debugMode', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>Log Level</Label>
                <Select
                  value={settings.performance.logLevel}
                  onValueChange={(value) => handlePerformanceSettingChange('logLevel', value)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="debug">Debug</SelectItem>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="warn">Warning</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                  </SelectContent>
                </Select>
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
                <Select
                  value={settings.memory.maxItems.toString()}
                  onValueChange={(value) => handleMemorySettingChange('maxItems', parseInt(value))}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="500">500</SelectItem>
                    <SelectItem value="1000">1,000</SelectItem>
                    <SelectItem value="2000">2,000</SelectItem>
                    <SelectItem value="5000">5,000</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label>Retention Days</Label>
                <Select
                  value={settings.memory.retentionDays.toString()}
                  onValueChange={(value) => handleMemorySettingChange('retentionDays', parseInt(value))}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7 days</SelectItem>
                    <SelectItem value="14">14 days</SelectItem>
                    <SelectItem value="30">30 days</SelectItem>
                    <SelectItem value="90">90 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label>Vector Search</Label>
                <Switch
                  checked={settings.memory.vectorSearch}
                  onCheckedChange={(checked) => handleMemorySettingChange('vectorSearch', checked)}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Similarity Threshold</Label>
                  <span className="text-sm text-muted-foreground">{settings.memory.similarityThreshold}</span>
                </div>
                <Slider
                  min={0.5}
                  max={1}
                  step={0.05}
                  value={[settings.memory.similarityThreshold]}
                  onValueChange={([value]) => handleMemorySettingChange('similarityThreshold', value)}
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
                <Select
                  value={settings.security.apiKeyRotation.toString()}
                  onValueChange={(value) => handleSecuritySettingChange('apiKeyRotation', parseInt(value))}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7 days</SelectItem>
                    <SelectItem value="14">14 days</SelectItem>
                    <SelectItem value="30">30 days</SelectItem>
                    <SelectItem value="90">90 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label>Sandbox Mode</Label>
                <Switch
                  checked={settings.security.sandboxMode}
                  onCheckedChange={(checked) => handleSecuritySettingChange('sandboxMode', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>Content Filtering</Label>
                <Switch
                  checked={settings.security.contentFiltering}
                  onCheckedChange={(checked) => handleSecuritySettingChange('contentFiltering', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>Max Tokens Per Request</Label>
                <Select
                  value={settings.security.maxTokensPerRequest.toString()}
                  onValueChange={(value) => handleSecuritySettingChange('maxTokensPerRequest', parseInt(value))}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2048">2,048</SelectItem>
                    <SelectItem value="4096">4,096</SelectItem>
                    <SelectItem value="8192">8,192</SelectItem>
                    <SelectItem value="16384">16,384</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end space-x-4">
        <Button variant="outline" onClick={resetSettings}>
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset
        </Button>
      </div>
    </div>
  );
}

export default function SettingsPanel() {
  return (
    <ToolhouseErrorBoundary>
      <Suspense fallback={<LoadingSpinner />}>
        <SettingsContent />
      </Suspense>
    </ToolhouseErrorBoundary>
  );
}
