import React from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, XCircle, Clock, User, Bot, ThumbsUp, ThumbsDown, Flag } from 'lucide-react'
import type { Message } from '../types'
import { cn } from '../lib/utils'
import { MarkdownRenderer } from './chat/MarkdownRenderer'
import { Button } from './ui/button'

interface ChatMessageProps {
  message: Message
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn('flex gap-3', isUser ? 'justify-end' : 'justify-start')}
    >
      <div
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
          isUser ? 'bg-blue-500' : 'bg-purple-500'
        )}
      >
        {isUser ? <User className="h-5 w-5 text-white" /> : <Bot className="h-5 w-5 text-white" />}
      </div>

      <div
        className={cn(
          'flex max-w-[80%] items-start gap-2 rounded-2xl p-4',
          isUser
            ? 'rounded-tr-none bg-blue-500 text-white'
            : 'rounded-tl-none bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
          message.status === 'error' && 'bg-red-100 dark:bg-red-900/20'
        )}
      >
        <div className="flex-1 break-words">
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <MarkdownRenderer
              content={message.content}
              className={cn('text-sm', isUser ? 'text-white' : 'text-gray-800 dark:text-gray-200')}
            />
          )}
        </div>

        {message.status && (
          <div className="ml-2 flex shrink-0 items-center">
            {message.status === 'sent' && (
              <CheckCircle2 size={16} className="text-green-500 dark:text-green-400" />
            )}
            {message.status === 'error' && <XCircle size={16} className="text-red-500" />}
            {message.status === 'sending' && (
              <Clock size={16} className="animate-spin text-gray-400" />
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm">
          <ThumbsUp className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm">
          <ThumbsDown className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm">
          <Flag className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  )
}
