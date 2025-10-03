import React, { useState } from 'react'
import { Check, ChevronDown, RefreshCw, Filter, SortAsc, SortDesc } from 'lucide-react'
import { Button } from '../ui/button'
import { llmManager } from '../../lib/llm/providers'
import { useLLM } from '../../hooks/useLLM'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'

export function ProviderSelector() {
  const { activeProvider, switchProvider } = useLLM()
  const provider = llmManager.getActiveProvider()
  const [filterType, setFilterType] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  const filteredProviders = filterType
    ? Array.from(llmManager['providers'].values()).filter(p => p.type === filterType)
    : Array.from(llmManager['providers'].values())

  const sortedProviders = filteredProviders.sort((a, b) => {
    if (sortOrder === 'asc') {
      return a.name.localeCompare(b.name)
    } else {
      return b.name.localeCompare(a.name)
    }
  })

  return (
    <div className="flex items-center space-x-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2">
            {provider.name}
            <ChevronDown size={16} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {sortedProviders.map(p => (
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
      <Button variant="outline" size="sm" onClick={() => setFilterType(filterType ? null : 'type')}>
        <Filter className="mr-2 h-4 w-4" />
        {filterType ? 'Clear Filter' : 'Filter by Type'}
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
      >
        {sortOrder === 'asc' ? (
          <SortAsc className="mr-2 h-4 w-4" />
        ) : (
          <SortDesc className="mr-2 h-4 w-4" />
        )}
        Sort by Name
      </Button>
      <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
        <RefreshCw className="mr-2 h-4 w-4" />
        Refresh Providers
      </Button>
    </div>
  )
}
