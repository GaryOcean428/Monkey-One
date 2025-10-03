import React from 'react'
import type { Message } from '../types'

interface MessageListProps {
  messages: Message[]
}

export function MessageList({ messages }: MessageListProps) {
  return (
    <div className="flex-1 space-y-4 overflow-y-auto p-4 font-mono">
      {messages.map(message => (
        <div
          key={message.id}
          className={`${message.role === 'user' ? 'text-blue-400' : 'text-green-400'}`}
        >
          <div className="flex items-start">
            <span className="mt-1 mr-2 font-bold">{message.role === 'user' ? '>' : '$'}</span>
            <div
              className="flex-1 whitespace-pre-wrap"
              dangerouslySetInnerHTML={{
                __html: formatContent(message.content),
              }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

function formatContent(content: string): string {
  return content.replace(
    /```(\w+)?\n([\s\S]*?)```/g,
    '<pre class="bg-gray-800 p-4 rounded-lg my-2"><code>$2</code></pre>'
  )
}
