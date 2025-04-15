import React, { useState, useRef, useEffect } from 'react';
import { useToast } from '../ui/use-toast';
import { z } from 'zod';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Card } from '../ui/card';
import { LoadingSpinner } from '../ui/loading-spinner';
import { generateStructuredData, streamAIResponse } from '@/lib/ai';
import { marked } from 'marked';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export function AIStreamingChat() {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedResponse, setStreamedResponse] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamedResponse]);
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prompt.trim()) return;
    
    // Add user message to chat
    const userMessage = { role: 'user', content: prompt };
    setMessages(prev => [...prev, userMessage]);
    
    try {
      setIsLoading(true);
      setIsStreaming(true);
      setStreamedResponse('');
      
      // Get stream from API
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          system: 'You are a helpful AI assistant that provides clear, accurate answers.',
          stream: true,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to get streaming response');
      }
      
      // Read the stream
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      
      if (!reader) {
        throw new Error('Failed to get response reader');
      }
      
      let done = false;
      let accumulated = '';
      
      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          accumulated += chunk;
          setStreamedResponse(accumulated);
        }
      }
      
      // Add the complete assistant message to chat
      setMessages(prev => [...prev, { role: 'assistant', content: accumulated }]);
      
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to get AI response',
        variant: 'destructive',
      });
      console.error('Error getting AI response:', error);
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
      setStreamedResponse('');
      setPrompt('');
    }
  };
  
  // Generate structured data example
  const generateSentimentAnalysis = async () => {
    try {
      setIsLoading(true);
      
      // Define schema for the structured output
      const schema = z.object({
        sentiment: z.enum(['positive', 'neutral', 'negative']),
        confidence: z.number().min(0).max(1),
        summary: z.string(),
        keywords: z.array(z.string()),
      });
      
      // Generate structured data
      const result = await generateStructuredData({
        prompt: prompt || 'Analyze the sentiment of this text: "I really enjoyed the new product experience, though there were a few minor issues."',
        schema,
        systemPrompt: 'You are a sentiment analysis assistant. Analyze the given text and return structured data about its sentiment.',
      });
      
      // Add the result to chat
      setMessages(prev => [
        ...prev, 
        { 
          role: 'assistant', 
          content: `**Sentiment Analysis Results**:
          
- **Sentiment**: ${result.sentiment}
- **Confidence**: ${(result.confidence * 100).toFixed(2)}%
- **Summary**: ${result.summary}
- **Keywords**: ${result.keywords.join(', ')}` 
        }
      ]);
      
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate sentiment analysis',
        variant: 'destructive',
      });
      console.error('Error generating sentiment analysis:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="flex flex-col space-y-4 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold">AI Chat with Streaming</h2>
      
      {/* Chat Messages */}
      <Card className="p-4 overflow-y-auto max-h-[500px]">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <p className="text-center text-muted-foreground">
              Send a message to start chatting with the AI assistant.
            </p>
          ) : (
            messages.map((message, i) => (
              <div 
                key={i} 
                className={`p-3 rounded-lg ${
                  message.role === 'user' 
                    ? 'bg-primary/10 ml-auto max-w-[80%]' 
                    : 'bg-secondary/10 mr-auto max-w-[80%]'
                }`}
              >
                <div 
                  className="prose dark:prose-invert"
                  dangerouslySetInnerHTML={{ 
                    __html: marked(message.content) 
                  }}
                />
              </div>
            ))
          )}
          
          {/* Streaming response */}
          {isStreaming && streamedResponse && (
            <div className="bg-secondary/10 p-3 rounded-lg mr-auto max-w-[80%]">
              <div 
                className="prose dark:prose-invert"
                dangerouslySetInnerHTML={{ 
                  __html: marked(streamedResponse)
                }}
              />
            </div>
          )}
          
          {/* Auto-scroll anchor */}
          <div ref={messagesEndRef} />
        </div>
      </Card>
      
      {/* Input Form */}
      <form onSubmit={handleSubmit} className="space-y-2">
        <Textarea
          placeholder="Ask something..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={isLoading}
          className="min-h-[100px]"
        />
        
        <div className="flex space-x-2">
          <Button 
            type="submit" 
            disabled={isLoading || !prompt.trim()}
            className="flex-1"
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Processing...
              </>
            ) : (
              'Send Message'
            )}
          </Button>
          
          <Button 
            type="button" 
            variant="outline"
            onClick={generateSentimentAnalysis}
            disabled={isLoading}
          >
            Generate Sentiment Analysis
          </Button>
        </div>
      </form>
    </div>
  );
}