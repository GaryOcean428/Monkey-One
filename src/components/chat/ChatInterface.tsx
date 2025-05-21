import React, { useCallback, useRef, useEffect } from 'react';
import { Send, Loader, RefreshCw, Filter, SortAsc, SortDesc } from 'lucide-react';
import { useChat } from '../../hooks/useChat';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';

export function ChatInterface() {
  const { messages, isProcessing, error, sendMessage, hasActiveAgent, clearChat } = useChat();
  const [input, setInput] = React.useState('');
  const [filterUser, setFilterUser] = React.useState<string | null>(null);
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('asc');
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

  const filteredMessages = filterUser
    ? messages.filter(message => message.user === filterUser)
    : messages;

  const sortedMessages = filteredMessages.sort((a, b) => {
    if (sortOrder === 'asc') {
      return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
    } else {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    }
  });

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between p-4">
        <Button variant="outline" size="sm" onClick={clearChat}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh Chat
        </Button>
        <Button variant="outline" size="sm" onClick={() => setFilterUser(filterUser ? null : 'user')}>
          <Filter className="w-4 h-4 mr-2" />
          {filterUser ? 'Clear Filter' : 'Filter by User'}
        </Button>
        <Button variant="outline" size="sm" onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}>
          {sortOrder === 'asc' ? <SortAsc className="w-4 h-4 mr-2" /> : <SortDesc className="w-4 h-4 mr-2" />}
          Sort by Time
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {sortedMessages.length === 0 ? (
          <div className="text-center text-muted-foreground mt-8">
            <p className="text-lg font-semibold">Welcome to Monkey One!</p>
            <p className="mt-2">
              {hasActiveAgent 
                ? 'Start chatting to begin.'
                : 'Please select an agent from the sidebar to begin.'}
            </p>
          </div>
        ) : (
          sortedMessages.map((message) => (
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

      <ChatInput
        onSendMessage={handleSubmit}
        disabled={!hasActiveAgent || isProcessing}
        placeholder={hasActiveAgent ? "Type a message..." : "Select an agent to start chatting"}
      />
    </div>
  );
}
