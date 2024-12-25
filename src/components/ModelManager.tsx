import React, { useEffect, useState } from 'react';
import { Card } from './ui/card';
import { Progress } from './ui/progress';
import { Button } from './ui/button';
import { LocalModelService } from '../lib/llm/LocalModelService';
import { Brain, Download, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from './ui/use-toast';

export function ModelManager() {
  const [status, setStatus] = useState<'not_loaded' | 'loading' | 'ready' | 'error'>('not_loaded');
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  const modelService = LocalModelService.getInstance();

  useEffect(() => {
    checkModelStatus();
  }, []);

  const checkModelStatus = async () => {
    try {
      const modelInfo = modelService.getModelInfo();
      setStatus(modelInfo.status);
      setError(modelInfo.error || null);
    } catch (err) {
      setStatus('error');
      setError('Failed to check model status');
    }
  };

  const handleInitialize = async () => {
    try {
      setStatus('loading');
      setError(null);
      await modelService.initialize();
      await checkModelStatus();
      toast({
        title: 'Model Initialized',
        description: 'The model is ready to use',
        variant: 'default'
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize model';
      setStatus('error');
      setError(errorMessage);
      toast({
        title: 'Initialization Failed',
        description: errorMessage,
        variant: 'destructive'
      });
    }
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Brain className="w-5 h-5" />
          <h3 className="text-lg font-semibold">Local Model</h3>
        </div>
        {status === 'ready' && (
          <CheckCircle className="w-5 h-5 text-green-500" />
        )}
        {status === 'error' && (
          <AlertCircle className="w-5 h-5 text-red-500" />
        )}
      </div>

      {status === 'loading' && (
        <div className="space-y-2">
          <Progress value={100} className="w-full" />
          <p className="text-sm text-muted-foreground">Initializing model...</p>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      {status !== 'loading' && status !== 'ready' && (
        <Button
          onClick={handleInitialize}
          className="w-full"
          disabled={status === 'loading'}
        >
          <Download className="w-4 h-4 mr-2" />
          Initialize Model
        </Button>
      )}
    </Card>
  );
}
