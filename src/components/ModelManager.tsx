import React, { useEffect, useState } from 'react';
import { Card } from './ui/card';
import { Progress } from './ui/progress';
import { Button } from './ui/button';
import { LocalModelService } from '../lib/llm/LocalModelService';
import { Brain, Download, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from './ui/use-toast';

export function ModelManager() {
  const [status, setStatus] = useState<'idle' | 'downloading' | 'ready' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  const modelService = LocalModelService.getInstance();

  useEffect(() => {
    checkModelStatus();
  }, []);

  const checkModelStatus = async () => {
    try {
      const cacheStatus = await modelService.checkCache();
      if (cacheStatus.isComplete) {
        setStatus('ready');
      }
    } catch (err) {
      setError('Failed to check model status');
    }
  };

  const handleInitialize = async () => {
    try {
      setStatus('downloading');
      setError(null);

      await modelService.initialize({
        onProgress: (progress) => {
          setProgress(Math.round(progress * 100));
        },
        onComplete: () => {
          setStatus('ready');
          toast({
            title: 'Model Ready',
            description: 'Phi-3.5 model is now ready for local inference',
          });
        }
      });
    } catch (err) {
      setStatus('error');
      setError('Failed to initialize model');
      toast({
        title: 'Error',
        description: 'Failed to initialize model. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const modelInfo = modelService.getModelInfo();

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium">Local Model</h3>
            <p className="text-sm text-muted-foreground">Phi-3.5 (4-bit Quantized)</p>
          </div>
          {status === 'ready' ? (
            <CheckCircle className="w-6 h-6 text-green-500" />
          ) : status === 'downloading' ? (
            <Brain className="w-6 h-6 text-blue-500 animate-pulse" />
          ) : (
            <Download className="w-6 h-6 text-blue-500" />
          )}
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Size: {modelInfo.size}</span>
            <span>Context: 128K tokens</span>
          </div>

          {status === 'downloading' && (
            <div className="space-y-2">
              <Progress value={progress} />
              <p className="text-sm text-center text-muted-foreground">
                Downloading and initializing model... {progress}%
              </p>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 text-red-500 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}
        </div>

        <Button
          onClick={handleInitialize}
          disabled={status === 'downloading' || status === 'ready'}
          className="w-full"
        >
          {status === 'ready' 
            ? 'Model Ready' 
            : status === 'downloading'
            ? 'Downloading...'
            : 'Initialize Model'}
        </Button>
      </div>
    </Card>
  );
}
