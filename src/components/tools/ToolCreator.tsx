import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Wand2, Code2, Plus, Save, X, Trash2, HelpCircle, AlertCircle } from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { useTools } from '../../hooks/useTools'
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '../ui/tooltip'

interface Parameter {
  id: string
  name: string
  type: string
  description: string
  required: boolean
}

const TYPE_EXAMPLES = {
  string: ['user name', 'email address', 'file path'],
  number: ['age', 'price', 'quantity'],
  boolean: ['is active', 'has account', 'enable feature'],
  object: ['user profile', 'configuration settings', 'request options'],
  array: ['list of items', 'user ids', 'file paths'],
}

const TYPE_DESCRIPTIONS = {
  string: 'Text values like names, descriptions, or IDs',
  number: 'Numeric values like counts, measurements, or calculations',
  boolean: 'True/false values for flags or conditions',
  object: 'Complex data with multiple properties',
  array: 'Lists or collections of values',
}

export function ToolCreator() {
  const { generateTool } = useTools()
  const [spec, setSpec] = useState({
    name: '',
    description: '',
    parameters: [] as Parameter[],
    expectedOutput: '',
  })
  const [showHelp, setShowHelp] = useState(true)

  const handleGenerate = async () => {
    if (!spec.name || !spec.description) return
    await generateTool(spec)
  }

  const addParameter = () => {
    setSpec(s => ({
      ...s,
      parameters: [
        ...s.parameters,
        {
          id: crypto.randomUUID(),
          name: '',
          type: 'string',
          description: '',
          required: true,
        },
      ],
    }))
  }

  const updateParameter = (id: string, updates: Partial<Parameter>) => {
    setSpec(s => ({
      ...s,
      parameters: s.parameters.map(p => (p.id === id ? { ...p, ...updates } : p)),
    }))
  }

  const removeParameter = (id: string) => {
    setSpec(s => ({
      ...s,
      parameters: s.parameters.filter(p => p.id !== id),
    }))
  }

  const getParameterSuggestions = (type: string) => {
    return TYPE_EXAMPLES[type as keyof typeof TYPE_EXAMPLES] || []
  }

  return (
    <TooltipProvider>
      <div className="flex h-full flex-col rounded-lg bg-white shadow-sm dark:bg-gray-800">
        <div className="border-b border-gray-200 p-4 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold dark:text-white">Create New Tool</h2>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" onClick={() => setShowHelp(!showHelp)}>
                    <HelpCircle
                      className={`h-4 w-4 ${showHelp ? 'text-blue-500' : 'text-gray-400'}`}
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Toggle help tooltips</TooltipContent>
              </Tooltip>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleGenerate}>
                <Wand2 className="mr-2 h-4 w-4" />
                Generate
              </Button>
              <Button variant="default" size="sm">
                <Save className="mr-2 h-4 w-4" />
                Save Tool
              </Button>
            </div>
          </div>
        </div>

        {showHelp && (
          <div className="border-b bg-blue-50 p-4 dark:border-gray-700 dark:bg-blue-900/20">
            <div className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 h-5 w-5 text-blue-500" />
              <div>
                <h3 className="font-medium text-blue-700 dark:text-blue-300">Quick Guide</h3>
                <p className="mt-1 text-sm text-blue-600 dark:text-blue-200">
                  1. Start with a clear, descriptive name for your tool
                  <br />
                  2. Explain what your tool does in the description
                  <br />
                  3. Add parameters that your tool needs to work
                  <br />
                  4. Specify what output to expect from the tool
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <label className="block text-sm font-medium dark:text-white">Tool Name</label>
              {showHelp && (
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    Use a clear, descriptive name like 'calculateTotal' or 'formatDate'
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
            <Input
              value={spec.name}
              onChange={e => setSpec(s => ({ ...s, name: e.target.value }))}
              placeholder="e.g., calculateDiscount, formatAddress"
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <label className="block text-sm font-medium dark:text-white">Description</label>
              {showHelp && (
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    Explain what your tool does, what it takes as input, and what it returns
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
            <Textarea
              value={spec.description}
              onChange={e => setSpec(s => ({ ...s, description: e.target.value }))}
              placeholder="e.g., Calculates the discount amount based on the original price and discount percentage"
              rows={3}
              className="w-full"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <label className="block text-sm font-medium dark:text-white">Parameters</label>
                {showHelp && (
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="h-4 w-4 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>Add inputs that your tool needs to work with</TooltipContent>
                  </Tooltip>
                )}
              </div>
              <Button variant="outline" size="sm" onClick={addParameter}>
                <Plus className="mr-2 h-4 w-4" />
                Add Parameter
              </Button>
            </div>

            <AnimatePresence>
              {spec.parameters.map(param => (
                <motion.div
                  key={param.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3 rounded-lg bg-gray-50 p-4 dark:bg-gray-900"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium dark:text-white">Parameter Details</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeParameter(param.id)}
                      className="text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="mb-1 flex items-center gap-2">
                        <label className="block text-sm text-gray-600 dark:text-gray-400">
                          Name
                        </label>
                        {showHelp && (
                          <Tooltip>
                            <TooltipTrigger>
                              <HelpCircle className="h-4 w-4 text-gray-400" />
                            </TooltipTrigger>
                            <TooltipContent>
                              Use clear, descriptive names for your parameters
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                      <Input
                        value={param.name}
                        onChange={e => updateParameter(param.id, { name: e.target.value })}
                        placeholder={getParameterSuggestions(param.type)[0]}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <div className="mb-1 flex items-center gap-2">
                        <label className="block text-sm text-gray-600 dark:text-gray-400">
                          Type
                        </label>
                        {showHelp && (
                          <Tooltip>
                            <TooltipTrigger>
                              <HelpCircle className="h-4 w-4 text-gray-400" />
                            </TooltipTrigger>
                            <TooltipContent>
                              {TYPE_DESCRIPTIONS[param.type as keyof typeof TYPE_DESCRIPTIONS]}
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                      <Select
                        value={param.type}
                        onValueChange={value => updateParameter(param.id, { type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="string">String (text)</SelectItem>
                          <SelectItem value="number">Number</SelectItem>
                          <SelectItem value="boolean">Boolean (true/false)</SelectItem>
                          <SelectItem value="object">Object (complex data)</SelectItem>
                          <SelectItem value="array">Array (list)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <div className="mb-1 flex items-center gap-2">
                      <label className="block text-sm text-gray-600 dark:text-gray-400">
                        Description
                      </label>
                      {showHelp && (
                        <Tooltip>
                          <TooltipTrigger>
                            <HelpCircle className="h-4 w-4 text-gray-400" />
                          </TooltipTrigger>
                          <TooltipContent>Explain what this parameter is used for</TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                    <Input
                      value={param.description}
                      onChange={e => updateParameter(param.id, { description: e.target.value })}
                      placeholder={`e.g., The ${getParameterSuggestions(param.type)[0]} to process`}
                      className="w-full"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`required-${param.id}`}
                      checked={param.required}
                      onChange={e => updateParameter(param.id, { required: e.target.checked })}
                      className="rounded border-gray-300 dark:border-gray-600"
                    />
                    <label
                      htmlFor={`required-${param.id}`}
                      className="text-sm text-gray-600 dark:text-gray-400"
                    >
                      Required parameter
                    </label>
                    {showHelp && (
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="h-4 w-4 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          Check this if the parameter must be provided
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <label className="block text-sm font-medium dark:text-white">Expected Output</label>
              {showHelp && (
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    Describe what your tool will return when it's done
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
            <Textarea
              value={spec.expectedOutput}
              onChange={e => setSpec(s => ({ ...s, expectedOutput: e.target.value }))}
              placeholder="e.g., Returns a number representing the calculated discount amount"
              rows={2}
              className="w-full"
            />
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
