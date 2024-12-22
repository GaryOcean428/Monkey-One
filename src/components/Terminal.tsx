import React, { useRef } from 'react';
import { Terminal as TerminalIcon, Circle } from 'lucide-react';
import type { Message } from '../types';
import { MessageList } from './MessageList';
import { CommandInput } from './CommandInput';

interface TerminalProps {
  messages: Message[];
  onSendMessage: (content: string) => void;
  isProcessing: boolean;
}

export default function Terminal({ messages, onSendMessage, isProcessing }: TerminalProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex flex-col h-screen bg-gray-900 border-l border-gray-800">
      <div className="flex items-center px-4 py-2 bg-gray-800 border-b border-gray-700">
        <TerminalIcon className="w-5 h-5 text-green-400 mr-2" />
        <h2 className="text-green-400 font-mono">Agent One Terminal</h2>
        {isProcessing && (
          <div className="ml-auto flex items-center">
            <Circle className="w-3 h-3 text-green-400 animate-pulse" />
            <span className="text-green-400 ml-2 text-sm">Processing...</span>
          </div>
        )}
      </div>
      
      <MessageList messages={messages} />
      <div ref={messagesEndRef} />
      
      <CommandInput 
        onSendMessage={onSendMessage}
        isProcessing={isProcessing}
      />
    </div>
  );
}