import React from 'react'
import { X, Bot, Brain, Shield } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs'
import { Slider } from './ui/slider'
import { Switch } from './ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Button } from './ui/button'
import { useLocation, useNavigate } from 'react-router'

interface SettingsPanelProps {
  onClose?: () => void
  isModal?: boolean
}

export function SettingsPanel({ onClose, isModal = false }: SettingsPanelProps) {
  const navigate = useNavigate()
  const location = useLocation()

  const handleClose = () => {
    if (isModal && onClose) {
      onClose()
    } else {
      navigate(-1)
    }
  }

  return (
    <div
      className={
        isModal
          ? 'bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black'
          : 'h-full'
      }
    >
      <div
        className={`overflow-hidden rounded-lg bg-white shadow-xl dark:bg-gray-800 ${isModal ? 'max-h-[90vh] w-full max-w-4xl' : 'h-full w-full'}`}
      >
        <div className="flex items-center justify-between border-b p-4 dark:border-gray-700">
          <h2 className="text-xl font-semibold dark:text-white">Settings</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X size={24} />
          </button>
        </div>

        <Tabs defaultValue="llm" className="flex h-[calc(90vh-4rem)]">
          <div className="w-48 space-y-4 border-r p-4 dark:border-gray-700">
            <TabsList className="flex w-full flex-col space-y-2">
              <TabsTrigger value="llm" className="w-full justify-start gap-2">
                <Bot size={16} />
                LLM Settings
              </TabsTrigger>
              <TabsTrigger value="brain" className="w-full justify-start gap-2">
                <Brain size={16} />
                Neural Settings
              </TabsTrigger>
              <TabsTrigger value="security" className="w-full justify-start gap-2">
                <Shield size={16} />
                Security
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <TabsContent value="llm">
              <div className="space-y-6">
                <div>
                  <h3 className="mb-4 text-lg font-medium dark:text-white">
                    Language Model Settings
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium dark:text-white">
                        Provider & Model
                      </label>
                      <Select defaultValue="gpt-4">
                        <SelectTrigger>
                          <SelectValue placeholder="Select a model" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="gpt-4">GPT-4</SelectItem>
                          <SelectItem value="gpt-3.5">GPT-3.5</SelectItem>
                          <SelectItem value="claude">Claude</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="dark:text-white">Temperature</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">0.7</span>
                      </div>
                      <Slider defaultValue={[0.7]} max={1} step={0.1} />
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="dark:text-white">Stream Responses</span>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="brain">
              <div className="space-y-6">
                <div>
                  <h3 className="mb-4 text-lg font-medium dark:text-white">
                    Neural Network Settings
                  </h3>
                  {/* Neural settings content */}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="security">
              <div className="space-y-6">
                <div>
                  <h3 className="mb-4 text-lg font-medium dark:text-white">Security Settings</h3>
                  {/* Security settings content */}
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>

        <div className="flex justify-end gap-2 border-t p-4 dark:border-gray-700">
          <Button variant="outline">Reset to Defaults</Button>
          <Button onClick={handleClose}>Save Changes</Button>
        </div>
      </div>
    </div>
  )
}
