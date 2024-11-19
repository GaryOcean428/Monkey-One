import React from 'react';
import { ChatInterface } from './ChatInterface';
import { TaskPanel } from './TaskPanel';
import { IntegrationsBar } from './IntegrationsBar';
import { useChat } from '@/hooks/useChat';
import { TooltipProvider } from '../ui/tooltip';

export function ChatContainer() {
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

  return (
    <TooltipProvider>
      <div className="flex h-full">
        <div className="flex-1 flex flex-col relative">
          <ChatInterface />
          {activeTask && <TaskPanel task={activeTask} actions={pendingActions} />}
        </div>
        <IntegrationsBar />
      </div>
    </TooltipProvider>
  );
}