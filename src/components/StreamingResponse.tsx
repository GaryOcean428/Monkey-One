import React, { useEffect, useRef, useState } from 'react';
import { generateStreamingResponse } from '../lib/models';
import { useMonitoring } from '../hooks/useMonitoring';
import { models, ModelName } from '../lib/models';

interface StreamingResponseProps {
  prompt: string;
  modelName?: ModelName;
  options?: Record<string, any>;
  onComplete?: (fullResponse: string) => void;
  className?: string;
}

export const StreamingResponse: React.FC<StreamingResponseProps> = ({
  prompt,
  modelName,
  options,
  onComplete,
  className
}) => {
  const [response, setResponse] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const responseRef = useRef<string>('');
  const { logEvent } = useMonitoring();

  useEffect(() => {
    const streamResponse = async () => {
      setIsStreaming(true);
      setError(null);
      responseRef.current = '';

      const startTime = performance.now();
      
      try {
        const selectedModel = modelName || 'granite3.1-dense:2b';
        const generator = generateStreamingResponse(prompt, selectedModel, options);
        
        for await (const chunk of generator) {
          if (chunk.done) {
            break;
          }
          
          responseRef.current += chunk.text;
          setResponse(responseRef.current);
        }

        const endTime = performance.now();
        logEvent('streamingResponse', {
          modelName: selectedModel,
          promptLength: prompt.length,
          responseLength: responseRef.current.length,
          duration: endTime - startTime
        });

        onComplete?.(responseRef.current);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        setError(errorMessage);
        logEvent('streamingError', {
          modelName,
          error: errorMessage
        });
      } finally {
        setIsStreaming(false);
      }
    };

    streamResponse();
  }, [prompt, modelName, options, onComplete]);

  return (
    <div className={className}>
      {isStreaming && (
        <div className="streaming-indicator">
          <div className="streaming-dot" />
          <span>AI is thinking...</span>
        </div>
      )}
      
      <div className="response-content">
        {response.split('\n').map((line, index) => (
          <p key={index}>{line || '\u00A0'}</p>
        ))}
      </div>

      {error && (
        <div className="error-message">
          Error: {error}
        </div>
      )}

      <style jsx>{`
        .streaming-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
          color: #666;
        }

        .streaming-dot {
          width: 8px;
          height: 8px;
          background-color: #0066cc;
          border-radius: 50%;
          animation: pulse 1.5s infinite;
        }

        .response-content {
          white-space: pre-wrap;
          line-height: 1.5;
        }

        .error-message {
          color: #dc3545;
          margin-top: 12px;
          padding: 8px;
          border-radius: 4px;
          background-color: #fff5f5;
        }

        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.4; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};
