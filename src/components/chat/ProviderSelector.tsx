import React from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { Button } from '../ui/button';
import { llmManager } from '../../lib/llm/providers';
import { useLLM } from '../../hooks/useLLM';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

export function ProviderSelector() {
  const { activeProvider, switchProvider } = useLLM();
  const provider = llmManager.getActiveProvider();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          {provider.name}
          <ChevronDown size={16} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {Array.from(llmManager['providers'].values()).map((p) => (
          <DropdownMenuItem
            key={p.id}
            onClick={() => switchProvider(p.id)}
            className="flex items-center justify-between"
          >
            {p.name}
            {p.id === activeProvider && <Check size={16} />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}