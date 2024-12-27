import React, { useEffect, useRef, useState } from 'react';
import { useSettingsStore } from '../../store/settingsStore';
import { useChatStore } from '../../store/chatStore';
import { useAgentStore } from '../../store/agentStore';
import { Message } from '../../types';
import { ChatInput } from './ChatInput';
import { ChatMessage } from './ChatMessage';
import { ErrorBoundary } from '../ErrorBoundary';
import { LoadingSpinner } from '../ui/loading-spinner';
import { Alert } from '../ui/alert';
import { ChatInterface } from './ChatInterface';
import { TaskPanel } from './TaskPanel';
import { IntegrationsBar } from './IntegrationsBar';
import { useChat } from '../../hooks/useChat';
import { TooltipProvider } from '../ui/tooltip';

export function ChatContainer() {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const { messages, isProcessing, sendMessage } = useChatStore();
  const { activeAgent } = useAgentStore();
  const { settings } = useSettingsStore();
  const { activeTask, tasks } = useChat();

  const pendingActions = tasks
    .filter(t => t.status === 'pending')
    .map(t => ({
      id: t.id,
      type: 'task',
      description: t.title,
      status: 'pending',
      payload: t
    }));

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    try {
      setError(null);
      if (!activeAgent) {
        throw new Error('No active agent selected');
      }
      await sendMessage(content, activeAgent.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
      console.error('Error sending message:', err);
    }
  };

  return (
    <ErrorBoundary>
      <TooltipProvider>
        <div className="flex h-full">
          <div className="flex-1 flex flex-col relative">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message: Message) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  settings={settings}
                />
              ))}
              {isProcessing && (
                <div className="flex justify-center">
                  <LoadingSpinner />
                </div>
              )}
              {error && (
                <Alert variant="error" className="mb-4">
                  {error}
                </Alert>
              )}
              <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t border-border">
              <ChatInput
                onSendMessage={handleSendMessage}
                disabled={isProcessing || !activeAgent}
                placeholder={!activeAgent ? 'Select an agent to start chatting' : 'Type a message...'}
              />
            </div>
            <ChatInterface />
            {activeTask && <TaskPanel task={activeTask} actions={pendingActions} />}
          </div>
          <IntegrationsBar />
        </div>
      </TooltipProvider>
    </ErrorBoundary>
  );
}