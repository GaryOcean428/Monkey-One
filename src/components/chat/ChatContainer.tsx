import React, { useRef, useState } from 'react';
import { useChat } from '../../hooks/useChat';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { SystemThoughts } from '../SystemThoughts';
import { Integrations } from '../Integrations';
import { LoadingSpinner } from '../ui/loading-spinner';
import { Alert } from '../ui/alert';

export const ChatContainer: React.FC = () => {
  const { messages, isLoading, error, sendMessage, hasActiveAgent } = useChat();
  const [showThoughts, setShowThoughts] = useState(true);
  const [showIntegrations, setShowIntegrations] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async (content: string) => {
    try {
      await sendMessage(content);
      scrollToBottom();
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  return (
    <div className="flex h-full">
      {/* Main chat area */}
      <div className="flex-1 flex flex-col h-full">
        {/* Messages area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <ChatMessage key={index} message={message} />
          ))}
          {isLoading && (
            <div className="flex justify-center">
              <LoadingSpinner />
            </div>
          )}
          {error && (
            <Alert variant="destructive" className="mb-4">
              {error}
            </Alert>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="p-4 border-t border-border">
          <ChatInput 
            onSubmit={handleSend} 
            disabled={isLoading || !hasActiveAgent}
            placeholder={!hasActiveAgent ? 'Select an agent to start chatting' : 'Type a message...'}
          />
        </div>
      </div>

      {/* Right sidebars */}
      <div className="flex">
        {/* System Thoughts */}
        <div className={`border-l border-border transition-all duration-300 ${showThoughts ? 'w-80' : 'w-0'}`}>
          {showThoughts && <SystemThoughts />}
        </div>

        {/* Integrations */}
        <div className={`border-l border-border transition-all duration-300 ${showIntegrations ? 'w-80' : 'w-0'}`}>
          {showIntegrations && <Integrations />}
        </div>

        {/* Toggle buttons */}
        <div className="flex flex-col gap-2 p-2 border-l border-border">
          <button
            onClick={() => setShowThoughts(!showThoughts)}
            className="p-2 rounded hover:bg-accent/50"
          >
            {showThoughts ? '>' : '<'}
          </button>
          <button
            onClick={() => setShowIntegrations(!showIntegrations)}
            className="p-2 rounded hover:bg-accent/50"
          >
            {showIntegrations ? '>' : '<'}
          </button>
        </div>
      </div>
    </div>
  );
};