import React from 'react';
import { X, Sun, Moon, Type, Bell, Sliders, Cpu, Database, Bot, Gauge, Shield, Brain } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { Slider } from './ui/slider';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectLabel } from './ui/select';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { ModelManager } from './ModelManager';

const MODEL_OPTIONS = {
  local: [
    { value: 'phi-3.5', label: 'Phi-3.5 (Local)' }
  ],
  groq: [
    { value: 'mixtral-8x7b-instruct', label: 'Mixtral 8x7B' },
    { value: 'llama2-70b-4096', label: 'Llama-2 70B' }
  ],
  perplexity: [
    { value: 'pplx-70b-online', label: 'PPLX 70B' },
    { value: 'pplx-7b-online', label: 'PPLX 7B' }
  ],
  xai: [
    { value: 'xai-claude-instant-v1', label: 'Claude Instant' },
    { value: 'xai-claude-v2', label: 'Claude V2' }
  ]
};

interface SettingsPanelProps {
  onClose: () => void;
}

export function SettingsPanel({ onClose }: SettingsPanelProps) {
  const { settings, updateSettings, resetSettings } = useSettings();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <h2 className="text-xl font-semibold dark:text-white">Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X size={24} />
          </button>
        </div>

        <Tabs defaultValue="general" className="flex h-[calc(90vh-4rem)]">
          <div className="w-48 border-r dark:border-gray-700 p-4 space-y-4">
            <TabsList className="flex flex-col w-full space-y-2">
              <TabsTrigger value="general" className="w-full justify-start gap-2">
                <Settings size={16} />
                General
              </TabsTrigger>
              <TabsTrigger value="models" className="w-full justify-start gap-2">
                <Type size={16} />
                Models
              </TabsTrigger>
              <TabsTrigger value="brain" className="w-full justify-start gap-2">
                <Brain size={16} />
                Neural Settings
              </TabsTrigger>
              <TabsTrigger value="agents" className="w-full justify-start gap-2">
                <Cpu size={16} />
                Agent Settings
              </TabsTrigger>
              <TabsTrigger value="memory" className="w-full justify-start gap-2">
                <Database size={16} />
                Memory
              </TabsTrigger>
              <TabsTrigger value="performance" className="w-full justify-start gap-2">
                <Gauge size={16} />
                Performance
              </TabsTrigger>
              <TabsTrigger value="security" className="w-full justify-start gap-2">
                <Shield size={16} />
                Security
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 p-6 overflow-y-auto">
            <TabsContent value="general">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium dark:text-white mb-4">General Settings</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 dark:text-white">Theme</label>
                      <Select defaultValue="light">
                        <SelectTrigger>
                          <SelectValue placeholder="Select a theme" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">Light</SelectItem>
                          <SelectItem value="dark">Dark</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 dark:text-white">Notifications</label>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="models" className="p-4 space-y-4">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Model Settings</h3>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Default Model</label>
                      <Select
                        value={settings.llm?.defaultModel}
                        onValueChange={(value) => updateSettings({
                          llm: { ...settings.llm, defaultModel: value }
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a model" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectLabel>Local Models</SelectLabel>
                          {MODEL_OPTIONS.local.map(model => (
                            <SelectItem key={model.value} value={model.value}>
                              {model.label}
                            </SelectItem>
                          ))}
                          
                          <SelectLabel>Groq Models</SelectLabel>
                          {MODEL_OPTIONS.groq.map(model => (
                            <SelectItem key={model.value} value={model.value}>
                              {model.label}
                            </SelectItem>
                          ))}
                          
                          <SelectLabel>Perplexity Models</SelectLabel>
                          {MODEL_OPTIONS.perplexity.map(model => (
                            <SelectItem key={model.value} value={model.value}>
                              {model.label}
                            </SelectItem>
                          ))}
                          
                          <SelectLabel>XAI Models</SelectLabel>
                          {MODEL_OPTIONS.xai.map(model => (
                            <SelectItem key={model.value} value={model.value}>
                              {model.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Temperature
                      </label>
                      <div className="flex items-center gap-4">
                        <Slider
                          value={[settings.llm?.temperature || 0.7]}
                          min={0}
                          max={2}
                          step={0.1}
                          onValueChange={([value]) =>
                            updateSettings({
                              llm: { ...settings.llm, temperature: value }
                            })
                          }
                        />
                        <span className="text-sm text-muted-foreground w-12">
                          {settings.llm?.temperature || 0.7}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <ModelManager />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="brain">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium dark:text-white mb-4">Neural Network Settings</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 dark:text-white">Learning Rate</label>
                      <Slider
                        value={[0.001]}
                        min={0.0001}
                        max={0.01}
                        step={0.0001}
                        onValueChange={([value]) => {
                          // Update learning rate
                        }}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 dark:text-white">Hidden Layer Size</label>
                      <Select defaultValue="256">
                        <SelectTrigger>
                          <SelectValue placeholder="Select layer size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="128">128 neurons</SelectItem>
                          <SelectItem value="256">256 neurons</SelectItem>
                          <SelectItem value="512">512 neurons</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="dark:text-white">Enable Evolution</span>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="agents">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium dark:text-white mb-4">Agent Settings</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 dark:text-white">Max Concurrent Tasks</label>
                      <Input
                        type="number"
                        value={settings.agents?.maxConcurrentTasks}
                        onChange={(e) => updateSettings({
                          agents: { ...settings.agents, maxConcurrentTasks: parseInt(e.target.value) }
                        })}
                        min={1}
                        max={10}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 dark:text-white">Task Timeout (seconds)</label>
                      <Input
                        type="number"
                        value={settings.agents?.taskTimeout}
                        onChange={(e) => updateSettings({
                          agents: { ...settings.agents, taskTimeout: parseInt(e.target.value) }
                        })}
                        min={5}
                        max={300}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="dark:text-white">Auto Delegation</span>
                      <Switch
                        checked={settings.agents?.autoDelegation}
                        onCheckedChange={(checked) => updateSettings({
                          agents: { ...settings.agents, autoDelegation: checked }
                        })}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="memory">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium dark:text-white mb-4">Memory Settings</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 dark:text-white">Max Memory Items</label>
                      <Input
                        type="number"
                        value={settings.memory?.maxItems}
                        onChange={(e) => updateSettings({
                          memory: { ...settings.memory, maxItems: parseInt(e.target.value) }
                        })}
                        min={100}
                        max={10000}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 dark:text-white">Retention Days</label>
                      <Input
                        type="number"
                        value={settings.memory?.retentionDays}
                        onChange={(e) => updateSettings({
                          memory: { ...settings.memory, retentionDays: parseInt(e.target.value) }
                        })}
                        min={1}
                        max={365}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="dark:text-white">Vector Search</span>
                      <Switch
                        checked={settings.memory?.vectorSearch}
                        onCheckedChange={(checked) => updateSettings({
                          memory: { ...settings.memory, vectorSearch: checked }
                        })}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="performance">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium dark:text-white mb-4">Performance Settings</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 dark:text-white">Batch Size</label>
                      <Input
                        type="number"
                        value={settings.performance?.batchSize}
                        onChange={(e) => updateSettings({
                          performance: { ...settings.performance, batchSize: parseInt(e.target.value) }
                        })}
                        min={1}
                        max={128}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 dark:text-white">Cache Duration (seconds)</label>
                      <Input
                        type="number"
                        value={settings.performance?.cacheDuration}
                        onChange={(e) => updateSettings({
                          performance: { ...settings.performance, cacheDuration: parseInt(e.target.value) }
                        })}
                        min={60}
                        max={86400}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="dark:text-white">Enable Cache</span>
                      <Switch
                        checked={settings.performance?.cacheEnabled}
                        onCheckedChange={(checked) => updateSettings({
                          performance: { ...settings.performance, cacheEnabled: checked }
                        })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="dark:text-white">Debug Mode</span>
                      <Switch
                        checked={settings.performance?.debugMode}
                        onCheckedChange={(checked) => updateSettings({
                          performance: { ...settings.performance, debugMode: checked }
                        })}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="security">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium dark:text-white mb-4">Security Settings</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 dark:text-white">API Key Rotation (days)</label>
                      <Input
                        type="number"
                        value={settings.security?.apiKeyRotation}
                        onChange={(e) => updateSettings({
                          security: { ...settings.security, apiKeyRotation: parseInt(e.target.value) }
                        })}
                        min={1}
                        max={90}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 dark:text-white">Rate Limit (requests/minute)</label>
                      <Input
                        type="number"
                        value={settings.security?.rateLimit}
                        onChange={(e) => updateSettings({
                          security: { ...settings.security, rateLimit: parseInt(e.target.value) }
                        })}
                        min={10}
                        max={1000}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="dark:text-white">Sandbox Mode</span>
                      <Switch
                        checked={settings.security?.sandboxMode}
                        onCheckedChange={(checked) => updateSettings({
                          security: { ...settings.security, sandboxMode: checked }
                        })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="dark:text-white">Content Filtering</span>
                      <Switch
                        checked={settings.security?.contentFiltering}
                        onCheckedChange={(checked) => updateSettings({
                          security: { ...settings.security, contentFiltering: checked }
                        })}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>

        <div className="border-t dark:border-gray-700 p-4 flex justify-end gap-2">
          <Button variant="outline" onClick={resetSettings}>
            Reset to Defaults
          </Button>
          <Button onClick={onClose}>
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}