import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ToolhouseLoadingProps {
  className?: string;
  text?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
};

export const ToolhouseLoading: React.FC<ToolhouseLoadingProps> = ({
  className,
  text = 'Loading...',
  size = 'md',
}) => {
  return (
    <div className={cn('flex items-center justify-center space-x-2', className)}>
      <Loader2 className={cn('animate-spin', sizeClasses[size])} />
      {text && <span className="text-sm text-muted-foreground">{text}</span>}
    </div>
  );
};

interface ToolhouseLoadingWrapperProps {
  isLoading: boolean;
  error?: Error | null;
  children: React.ReactNode;
  loadingText?: string;
  className?: string;
}

export const ToolhouseLoadingWrapper: React.FC<ToolhouseLoadingWrapperProps> = ({
  isLoading,
  error,
  children,
  loadingText,
  className,
}) => {
  if (error) {
    return (
      <div className="text-destructive p-4 rounded-md bg-destructive/10">
        <p>Error: {error.message}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={cn('p-4', className)}>
        <ToolhouseLoading text={loadingText} />
      </div>
    );
  }

  return <>{children}</>;
};
