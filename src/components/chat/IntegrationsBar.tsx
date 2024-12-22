import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Mail, Github, Calendar, FileText, Cloud } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIntegrations } from '@/hooks/useIntegrations';
import { Button } from '../ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';

export function IntegrationsBar() {
  const [isExpanded, setIsExpanded] = useState(false);
  const { integrations, connectIntegration, disconnectIntegration } = useIntegrations();

  const handleIntegrationClick = async (id: string, isConnected: boolean) => {
    try {
      if (isConnected) {
        await disconnectIntegration(id);
      } else {
        await connectIntegration(id);
      }
    } catch (error) {
      console.error('Integration error:', error);
    }
  };

  return (
    <motion.div
      initial={false}
      animate={{ width: isExpanded ? 300 : 48 }}
      className={cn(
        "border-l border-border bg-background",
        "flex flex-col h-full transition-all duration-300"
      )}
    >
      <div className="p-2 flex items-center justify-between border-b">
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
          <TooltipContent side="right">
            {isExpanded ? 'Collapse' : 'Expand'}
          </TooltipContent>
        </Tooltip>
        {isExpanded && <span className="font-medium">Integrations</span>}
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {integrations.map(({ id, name, icon: Icon, status }) => (
          <Tooltip key={id}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "w-full flex items-center gap-3 p-2 rounded-lg mb-1",
                  "hover:bg-accent hover:text-accent-foreground",
                  status === 'disconnected' && "opacity-50"
                )}
                onClick={() => handleIntegrationClick(id, status === 'connected')}
              >
                <Icon size={20} />
                {isExpanded && (
                  <div className="flex-1 text-left">
                    <span className="block">{name}</span>
                    <span className="text-xs text-muted-foreground capitalize">
                      {status}
                    </span>
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
  );
}