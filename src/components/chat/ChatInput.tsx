import React, { useState, KeyboardEvent, useCallback } from 'react';
import { useChatStore } from '../../store/chatStore';

interface ChatInputProps {
  onSubmit?: (message: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

/**
 * ChatInput component for handling user message input
 * @param {ChatInputProps} props - Component props
 * @returns {JSX.Element} Rendered chat input component
 */
export const ChatInput: React.FC<ChatInputProps> = ({
  onSubmit,
  placeholder = 'Type your message...',
  disabled = false,
}) => {
  const [message, setMessage] = useState('');
  const addMessage = useChatStore((state) => state.addMessage);

  const handleSubmit = useCallback(() => {
    if (message.trim()) {
      onSubmit?.(message);
      addMessage({
        role: 'user',
        content: message,
        timestamp: new Date().toISOString(),
      });
      setMessage('');
    }
  }, [message, onSubmit, addMessage]);

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex items-center gap-2 p-4 border-t border-gray-200 dark:border-gray-700">
      <textarea
        className="flex-1 min-h-[40px] max-h-[120px] p-2 rounded-md border border-gray-300 
                   dark:border-gray-600 dark:bg-gray-800 dark:text-white resize-none
                   focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder={placeholder}
        disabled={disabled}
        rows={1}
        aria-label="Chat input"
      />
      <button
        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 
                   disabled:bg-gray-400 disabled:cursor-not-allowed
                   focus:outline-none focus:ring-2 focus:ring-blue-500"
        onClick={handleSubmit}
        disabled={disabled || !message.trim()}
        aria-label="Send message"
      >
        Send
      </button>
    </div>
  );
};
