import React, { useRef, useState } from 'react'
import { useChat } from '../../hooks/useChat'
import { ChatMessage } from './ChatMessage'
import { ChatInput } from './ChatInput'
import { SystemThoughts } from '../SystemThoughts'
import { Integrations } from '../Integrations'
import { LoadingSpinner } from '../ui/loading-spinner'
import { Alert } from '../ui/alert'
import { useAgentStore } from '../../store/agentStore'

export const ChatContainer: React.FC = () => {
  const { messages, isLoading, error, sendMessage } = useChat()
  const [showThoughts] = useState(false)
  const [showIntegrations] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const activeAgent = useAgentStore(state => state.activeAgent)

  const scrollToBottom = () => {
    containerRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSend = async (content: string) => {
    try {
      await sendMessage(content)
      scrollToBottom()
    } catch (err) {
      console.error('Error sending message:', err)
    }
  }

  return (
    <div className="flex h-full">
      {/* Main chat area */}
      <div className="flex h-full flex-1 flex-col">
        {/* Messages area */}
        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          {!activeAgent && (
            <Alert>Please select an agent from the Agents panel to start chatting</Alert>
          )}
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
          <div ref={containerRef} />
        </div>

        {/* Input area */}
        <div className="border-t border-gray-200 dark:border-gray-800">
          <ChatInput
            onSendMessage={handleSend}
            disabled={isLoading || !activeAgent}
            placeholder={activeAgent ? 'Type a message...' : 'Select an agent to start chatting'}
          />
        </div>
      </div>

      {/* Right sidebar */}
      <div className="flex w-80 flex-col border-l border-gray-200 dark:border-gray-800">
        {/* System thoughts */}
        {showThoughts && (
          <div className="flex-1 overflow-y-auto p-4">
            <SystemThoughts />
          </div>
        )}

        {/* Integrations */}
        {showIntegrations && (
          <div className="flex-1 overflow-y-auto p-4">
            <Integrations />
          </div>
        )}
      </div>
    </div>
  )
}
