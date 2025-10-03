import React from 'react'
import { Check, ChevronDown } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { Button } from '../ui/button'
import { useLLM } from '../../hooks/useLLM'

export function ModelSelector() {
  const { activeProvider, switchProvider } = useLLM()

  const models = [
    // Local Models (GPU Accelerated)
    {
      id: 'phi4-gpu',
      name: 'Phi-4 (GPU)',
      description: 'Powerful 14.7B model optimized for GPU',
      parameters: '14.7B',
      size: '9GB',
      features: ['GPU Accelerated', 'High Performance'],
    },
    {
      id: 'llama3.2-1b',
      name: 'Llama 3.2 1B (Local)',
      description: 'Fast local model for personal tasks',
      parameters: '1.24B',
      quantization: 'Q2_K',
      size: '581MB',
    },
    {
      id: 'llama3.2-3b',
      name: 'Llama 3.2 3B (Local)',
      description: 'Powerful local model, outperforms Gemma & Phi',
      parameters: '3B',
      quantization: 'Q2_K',
      size: '1.7GB',
    },

    // Anthropic Models
    {
      id: 'claude-3-5-sonnet',
      name: 'Claude 3.5 Sonnet',
      description: 'Most intelligent model, text/image input',
      contextWindow: '200K',
    },
    {
      id: 'claude-3-5-haiku',
      name: 'Claude 3.5 Haiku',
      description: 'Fastest Claude 3.5 model',
      contextWindow: '200K',
    },

    // Perplexity Models
    {
      id: 'sonar-small',
      name: 'Sonar Small',
      description: 'Fast online search capabilities',
      contextWindow: '127K',
      parameters: '8B',
    },
    {
      id: 'sonar-large',
      name: 'Sonar Large',
      description: 'Advanced reasoning with integrated search',
      contextWindow: '127K',
      parameters: '70B',
    },
    {
      id: 'sonar-huge',
      name: 'Sonar Huge',
      description: 'Most powerful search-augmented model',
      contextWindow: '127K',
      parameters: '405B',
    },
  ]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          {models.find(m => m.id === activeProvider)?.name || 'Select Model'}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[300px]">
        {models.map(model => (
          <DropdownMenuItem
            key={model.id}
            onClick={() => switchProvider(model.id)}
            className="flex flex-col items-start px-4 py-2"
          >
            <div className="flex w-full items-center justify-between">
              <span className="font-medium">{model.name}</span>
              {activeProvider === model.id && <Check className="ml-2 h-4 w-4" />}
            </div>
            <span className="mt-1 text-sm text-gray-500">{model.description}</span>
            <div className="mt-1 flex flex-wrap gap-2">
              {model.contextWindow && (
                <span className="text-xs text-gray-400">Context: {model.contextWindow}</span>
              )}
              {model.parameters && (
                <span className="text-xs text-gray-400">Size: {model.parameters}</span>
              )}
              {model.quantization && (
                <span className="text-xs text-gray-400">Q: {model.quantization}</span>
              )}
              {model.size && <span className="text-xs text-gray-400">Disk: {model.size}</span>}
              {model.features && (
                <span className="text-xs text-gray-400">Features: {model.features.join(', ')}</span>
              )}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
