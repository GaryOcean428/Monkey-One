import React from 'react';
import { Check, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Button } from '../ui/button';
import { useLLM } from '../../hooks/useLLM';

export function ModelSelector() {
  const { activeProvider, switchProvider } = useLLM();

  const models = [
    // Local Models
    { id: 'phi3.5', name: 'Phi 3.5 (Local)' },
    
    // OpenAI Models
    { id: 'gpt-4o', name: 'GPT-4o' },
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini' },
    { id: 'o1', name: 'o1' },
    { id: 'o1-mini', name: 'o1 Mini' },
    
    // LLaMA Models
    { id: 'llama-3.3-70b-versatile', name: 'LLaMA 3.3 70B' },
    
    // Anthropic Models
    { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet' },
    { id: 'claude-3-5-haiku', name: 'Claude 3.5 Haiku' },
    
    // Qwen Models
    { id: 'qwq-32b', name: 'QwQ 32B Preview' },
    
    // Search Models
    { id: 'sonar-huge', name: 'Sonar Huge' },
    { id: 'sonar-large', name: 'Sonar Large' },
    { id: 'sonar-small', name: 'Sonar Small' }
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          {models.find(m => m.id === activeProvider)?.name || 'Select Model'}
          <ChevronDown className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        {models.map((model) => (
          <DropdownMenuItem
            key={model.id}
            onClick={() => switchProvider(model.id)}
            className="flex items-center justify-between"
          >
            {model.name}
            {model.id === activeProvider && <Check className="w-4 h-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}