import React, { useRef, useState } from 'react';
import { useChat } from '../../hooks/useChat';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { SystemThoughts } from '../SystemThoughts';
import { Integrations } from '../Integrations';
import { LoadingSpinner } from '../ui/loading-spinner';
import { Alert } from '../ui/alert';
import { useAgentStore } from '../../store/agentStore';

export const ChatContainer: React.FC = () => {
  const { messages, isLoading, error, sendMessage } = useChat();
  const [showThoughts, setShowThoughts] = useState(true);
  const [showIntegrations, setShowIntegrations] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasActiveAgent = useAgentStore(state => !!state.activeAgent);

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
            <ChatMessage key={message.id || index} message={message} />
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
        <ChatInput 
          onSendMessage={handleSend}
          disabled={isLoading || !hasActiveAgent}
          placeholder={hasActiveAgent ? "Type a message..." : "Please select an agent to start chatting"}
        />
      </div>

      {/* Right sidebar */}
      <div className="w-64 border-l border-gray-200 dark:border-gray-700 p-4 space-y-4">
        {/* System thoughts toggle */}
        <div className="flex items-center justify-between">
          <span>System Thoughts</span>
          <button
            onClick={() => setShowThoughts(!showThoughts)}
            className={`px-2 py-1 rounded ${
              showThoughts ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            {showThoughts ? 'Hide' : 'Show'}
          </button>
        </div>
        {showThoughts && <SystemThoughts />}

        {/* Integrations toggle */}
        <div className="flex items-center justify-between">
          <span>Integrations</span>
          <button
            onClick={() => setShowIntegrations(!showIntegrations)}
            className={`px-2 py-1 rounded ${
              showIntegrations ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            {showIntegrations ? 'Hide' : 'Show'}
          </button>
        </div>
        {showIntegrations && <Integrations />}
      </div>
    </div>
  );
};