import React, { useCallback, useRef, useEffect } from 'react';
import { useChat } from '../../hooks/useChat';
import { ChatMessage } from './ChatMessage';
import { MessageInput } from './MessageInput';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';

export function ChatInterface() {
  const { messages, isProcessing, error, sendMessage, hasActiveAgent } = useChat();
  const [input, setInput] = React.useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  React.useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [hasActiveAgent]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    if (!hasActiveAgent) {
      return;
    }

    const trimmedInput = input.trim();
    if (!trimmedInput || isProcessing) {
      return;
    }

    try {
      await sendMessage(trimmedInput);
      setInput('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSubmit();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    setInput(textarea.value);

    // Auto-resize
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-muted-foreground mt-8">
            <p className="text-lg font-semibold">Welcome to Monkey One!</p>
            <p className="mt-2">
              {hasActiveAgent 
                ? 'Start chatting to begin.'
                : 'Please select an agent from the sidebar to begin.'}
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {error && (
        <div className="mx-4 mb-4 p-4 border-l-4 border-destructive bg-destructive/10">
          <p className="text-destructive">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="border-t p-4 bg-background">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder={hasActiveAgent ? "Type a message..." : "Select an agent to start chatting"}
              disabled={!hasActiveAgent || isProcessing}
              rows={1}
              className={cn(
                "pr-12 min-h-[44px] max-h-[200px]",
                "focus:outline-none focus:ring-2 focus:ring-primary",
                !hasActiveAgent && "opacity-50 cursor-not-allowed",
                "transition-all duration-200 ease-in-out",
                "resize-none overflow-hidden leading-normal"
              )}
            />
          </div>
          <Button
            type="submit"
            disabled={!input.trim() || isProcessing || !hasActiveAgent}
            onClick={() => void handleSubmit()}
            className={cn(
              "h-11 px-4",
              isProcessing && "opacity-50",
              "transition-opacity duration-200"
            )}
          >
            {isProcessing ? (
              <Loader className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}