import React, { useRef, useState } from 'react'
import { useChat } from '../../hooks/useChat'
import { ChatMessage } from './ChatMessage'
import { ChatInput } from './ChatInput'
import { SystemThoughts } from '../SystemThoughts'
import { Integrations } from '../Integrations'
import { LoadingSpinner } from '../ui/loading-spinner'
import { Alert } from '../ui/alert'
import { useAgentStore } from '../../store/agentStore'
import { Button } from '../ui/button'
import { RefreshCw, Filter, SortAsc, SortDesc } from 'lucide-react'

export const ChatContainer: React.FC = () => {
  const { messages, isProcessing, error, sendMessage } = useChat()
  const [showThoughts] = useState(false)
  const [showIntegrations] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const activeAgent = useAgentStore(state => state.activeAgent)
  const [filterUser, setFilterUser] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

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

  const filteredMessages = filterUser
    ? messages.filter(message => message.user === filterUser)
    : messages

  const sortedMessages = [...filteredMessages].sort((a, b) => {
    if (sortOrder === 'asc') {
      return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    } else {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    }
  })

  return (
    <div className="flex h-full">
      {/* Main chat area */}
      <div className="flex h-full flex-1 flex-col">
        {/* Messages area */}
        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          <div className="mb-4 flex justify-between">
            <Button variant="outline" size="sm" onClick={scrollToBottom}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Chat
            </Button>
            <Button variant="outline" size="sm" onClick={() => setFilterUser(filterUser ? null : 'user')}>
              <Filter className="w-4 h-4 mr-2" />
              {filterUser ? 'Clear Filter' : 'Filter by User'}
            </Button>
            <Button variant="outline" size="sm" onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}>
              {sortOrder === 'asc' ? <SortAsc className="w-4 h-4 mr-2" /> : <SortDesc className="w-4 h-4 mr-2" />}
              Sort by Time
            </Button>
          </div>
          {!activeAgent && (
            <Alert>Please select an agent from the Agents panel to start chatting</Alert>
          )}
          {sortedMessages.map((message, index) => (
            <ChatMessage key={message.id || index} message={message} />
          ))}
          {isProcessing && (
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
            disabled={isProcessing || !activeAgent}
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
