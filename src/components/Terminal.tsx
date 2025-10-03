import React, { useRef } from 'react'
import { Terminal as TerminalIcon, Circle } from 'lucide-react'
import type { Message } from '../types'
import { MessageList } from './MessageList'
import { CommandInput } from './CommandInput'

interface TerminalProps {
  messages: Message[]
  onSendMessage: (content: string) => void
  isProcessing: boolean
}

export default function Terminal({ messages, onSendMessage, isProcessing }: TerminalProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  React.useEffect(() => {
    scrollToBottom()
  }, [messages])

  return (
    <div className="flex h-screen flex-col border-l border-gray-800 bg-gray-900">
      <div className="flex items-center border-b border-gray-700 bg-gray-800 px-4 py-2">
        <TerminalIcon className="mr-2 h-5 w-5 text-green-400" />
        <h2 className="font-mono text-green-400">Agent One Terminal</h2>
        {isProcessing && (
          <div className="ml-auto flex items-center">
            <Circle className="h-3 w-3 animate-pulse text-green-400" />
            <span className="ml-2 text-sm text-green-400">Processing...</span>
          </div>
        )}
      </div>

      <MessageList messages={messages} />
      <div ref={messagesEndRef} />

      <CommandInput onSendMessage={onSendMessage} isProcessing={isProcessing} />
    </div>
  )
}
