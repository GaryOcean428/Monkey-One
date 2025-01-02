import { useState, useCallback } from 'react';
import { llmManager } from '../lib/llm/providers';
import type { Message } from '../types';

export function useLLM() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(async (
    message: string,
    context?: Message[],
    onStream?: (chunk: string) => void
  ): Promise<string> => {
    setIsProcessing(true);
    setError(null);

    try {
      if (onStream) {
        let fullResponse = '';
        await llmManager.streamResponse(message, (chunk) => {
          fullResponse += chunk;
          onStream(chunk);
        });
        return fullResponse;
      } else {
        return await llmManager.sendMessage(message, context);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process message';
      setError(errorMessage);
      throw err;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const switchProvider = useCallback((providerId: string) => {
    try {
      llmManager.setActiveProvider(providerId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to switch provider');
      throw err;
    }
  }, []);

  return {
    sendMessage,
    switchProvider,
    isProcessing,
    error,
    activeProvider: llmManager.getActiveProvider().id
  };
}