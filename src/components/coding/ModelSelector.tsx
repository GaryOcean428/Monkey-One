import React from 'react';
import { Check, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Button } from '../ui/button';
import { useLLM } from '@/hooks/useLLM';

export function ModelSelector() {
  const { activeProvider, switchProvider } = useLLM();

  const models = [
    { id: 'qwen', name: 'Qwen 2.5 Coder' },
    { id: 'granite', name: 'Granite' }
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