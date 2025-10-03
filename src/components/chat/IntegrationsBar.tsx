import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  ChevronLeft,
  ChevronRight,
  Mail,
  Github,
  Calendar,
  FileText,
  Cloud,
  RefreshCw,
  Filter,
  SortAsc,
  SortDesc,
} from 'lucide-react'
import { cn } from '../../lib/utils'
import { useIntegrations } from '../../hooks/useIntegrations'
import { Button } from '../ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip'

export function IntegrationsBar() {
  const [isExpanded, setIsExpanded] = useState(false)
  const { integrations, connectIntegration, disconnectIntegration } = useIntegrations()
  const [filterType, setFilterType] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  const handleIntegrationClick = async (id: string, isConnected: boolean) => {
    try {
      if (isConnected) {
        await disconnectIntegration(id)
      } else {
        await connectIntegration(id)
      }
    } catch (error) {
      console.error('Integration error:', error)
    }
  }

  const filteredIntegrations = filterType
    ? integrations.filter(integration => integration.type === filterType)
    : integrations

  const sortedIntegrations = filteredIntegrations.sort((a, b) => {
    if (sortOrder === 'asc') {
      return a.name.localeCompare(b.name)
    } else {
      return b.name.localeCompare(a.name)
    }
  })

  return (
    <motion.div
      initial={false}
      animate={{ width: isExpanded ? 300 : 48 }}
      className={cn(
        'border-border bg-background border-l',
        'flex h-full flex-col transition-all duration-300'
      )}
    >
      <div className="flex items-center justify-between border-b p-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2"
            >
              {isExpanded ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">{isExpanded ? 'Collapse' : 'Expand'}</TooltipContent>
        </Tooltip>
        {isExpanded && <span className="font-medium">Integrations</span>}
      </div>

      <div className="flex justify-between p-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setFilterType(filterType ? null : 'type')}
        >
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
          Refresh Integrations
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {sortedIntegrations.map(({ id, name, icon: Icon, status }) => (
          <Tooltip key={id}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  'mb-1 flex w-full items-center gap-3 rounded-lg p-2',
                  'hover:bg-accent hover:text-accent-foreground',
                  status === 'disconnected' && 'opacity-50'
                )}
                onClick={() => handleIntegrationClick(id, status === 'connected')}
              >
                <Icon size={20} />
                {isExpanded && (
                  <div className="flex-1 text-left">
                    <span className="block">{name}</span>
                    <span className="text-muted-foreground text-xs capitalize">{status}</span>
                  </div>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              {`${status === 'connected' ? 'Disconnect' : 'Connect'} ${name}`}
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </motion.div>
  )
}
