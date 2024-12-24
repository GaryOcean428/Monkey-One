import React from 'react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { ToolhouseLoadingWrapper } from '@/components/Loading/ToolhouseLoading';

interface BasePanelProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  isLoading?: boolean;
  error?: Error | null;
  loadingText?: string;
  className?: string;
  headerActions?: React.ReactNode;
}

export const BasePanel: React.FC<BasePanelProps> = ({
  children,
  title,
  description,
  isLoading = false,
  error = null,
  loadingText = 'Loading...',
  className,
  headerActions,
}) => {
  return (
    <div className={cn('h-full p-6 overflow-y-auto', className)}>
      {(title || description) && (
        <div className="mb-6 flex justify-between items-start">
          <div>
            {title && <h1 className="text-2xl font-bold">{title}</h1>}
            {description && (
              <p className="text-muted-foreground mt-1">{description}</p>
            )}
          </div>
          {headerActions && (
            <div className="flex items-center space-x-2">{headerActions}</div>
          )}
        </div>
      )}
      
      <ToolhouseLoadingWrapper
        isLoading={isLoading}
        error={error}
        loadingText={loadingText}
        className="min-h-[200px]"
      >
        {children}
      </ToolhouseLoadingWrapper>
    </div>
  );
};
