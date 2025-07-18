import React, { useState, useRef, useCallback } from 'react';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { Send, X, Paperclip } from 'lucide-react';
import { useChat } from '../../hooks/useChat';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({ 
  onSendMessage, 
  disabled = false,
  placeholder = 'Type a message...'
}) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { sendMessage } = useChat();

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      sendMessage(message.trim());
      setMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  }, [message, onSendMessage, sendMessage, disabled]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }, [handleSubmit]);

  const handleInput = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, []);

  const handleClear = useCallback(() => {
    setMessage('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, []);

  const handleAttachFile = useCallback(() => {
    // Implement file attachment logic here
  }, []);

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 p-4 border-t border-gray-200 dark:border-gray-700">
      <Textarea
        ref={textareaRef}
        value={message}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className="min-h-[40px] max-h-[200px] resize-none"
        rows={1}
        aria-label="Chat input"
      />
      <Button 
        type="button" 
        onClick={handleClear}
        disabled={disabled}
        variant="ghost"
        size="icon"
      >
        <X className="h-5 w-5" />
      </Button>
      <Button 
        type="button" 
        onClick={handleAttachFile}
        disabled={disabled}
        variant="ghost"
        size="icon"
      >
        <Paperclip className="h-5 w-5" />
      </Button>
      <Button 
        type="submit" 
        disabled={!message.trim() || disabled}
        variant="ghost"
        size="icon"
      >
        <Send className="h-5 w-5" />
      </Button>
    </form>
  );
};
