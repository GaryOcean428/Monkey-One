import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { logger } from '../utils/logger';
import { ProviderRegistry } from '../lib/providers';
import { LocalProvider } from '../lib/providers';

interface ModelManagerProps {
  onInitialize?: () => void;
}

export function ModelManager({ onInitialize }: ModelManagerProps) {
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const providerRegistry = ProviderRegistry.getInstance();

  const handleInitialize = async () => {
    setIsInitializing(true);
    setError(null);

    try {
      const localProvider = new LocalProvider();
      await providerRegistry.registerProvider('local', localProvider);
      logger.info('Local provider initialized successfully');
      onInitialize?.();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      logger.error('Failed to initialize local provider:', err);
      setError(errorMessage);
    } finally {
      setIsInitializing(false);
    }
  };

  useEffect(() => {
    handleInitialize();
  }, []);

  if (error) {
    return (
      <Card className="p-4 bg-destructive/10">
        <h3 className="text-lg font-semibold mb-2">Service Initialization Error</h3>
        <p className="text-sm text-destructive mb-4">{error}</p>
        <Button 
          variant="outline" 
          onClick={handleInitialize}
          disabled={isInitializing}
        >
          {isInitializing ? 'Initializing...' : 'Retry'}
        </Button>
      </Card>
    );
  }

  return null;
}
