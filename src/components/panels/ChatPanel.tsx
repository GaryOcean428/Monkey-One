import React from 'react';
import { ChatContainer } from '../chat/ChatContainer';

export default function ChatPanel() {
  return (
    <div className="h-full flex flex-col bg-background">
      <ChatContainer />
    </div>
  );
}