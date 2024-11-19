import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Clock, User, Bot } from 'lucide-react';
import type { Message } from '../types';
import { cn } from '@/lib/utils';
import { MarkdownRenderer } from './chat/MarkdownRenderer';

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "flex gap-3",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
        isUser ? "bg-blue-500" : "bg-purple-500"
      )}>
        {isUser ? (
          <User className="w-5 h-5 text-white" />
        ) : (
          <Bot className="w-5 h-5 text-white" />
        )}
      </div>

      <div className={cn(
        "max-w-[80%] rounded-2xl p-4 flex items-start gap-2",
        isUser
          ? "bg-blue-500 text-white rounded-tr-none"
          : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-tl-none",
        message.status === 'error' && "bg-red-100 dark:bg-red-900/20"
      )}>
        <div className="flex-1 break-words">
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <MarkdownRenderer 
              content={message.content}
              className={cn(
                "text-sm",
                isUser ? "text-white" : "text-gray-800 dark:text-gray-200"
              )}
            />
          )}
        </div>
        
        {message.status && (
          <div className="flex items-center ml-2 shrink-0">
            {message.status === 'sent' && (
              <CheckCircle2 size={16} className="text-green-500 dark:text-green-400" />
            )}
            {message.status === 'error' && (
              <XCircle size={16} className="text-red-500" />
            )}
            {message.status === 'sending' && (
              <Clock size={16} className="text-gray-400 animate-spin" />
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}