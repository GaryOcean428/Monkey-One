import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { Send, Loader, RefreshCw, Filter, SortAsc, SortDesc } from 'lucide-react'
import { ChatMessage } from './ChatMessage'
import { useChat, Command } from '../hooks/useChat'
import { cn } from '../lib/utils'
import { Button } from './ui/button'
import { Textarea } from './ui/textarea'
import { Select } from './ui/select'

export const ChatInterface = React.memo(function ChatInterface() {
  const { messages, isProcessing, error, sendMessage, hasActiveAgent, availableCommands } =
    useChat()
  const [input, setInput] = useState('')
  const [selectedCommand, setSelectedCommand] = useState<Command | ''>('')
  const [streamingContent, setStreamingContent] = useState('')
  const [filterUser, setFilterUser] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, streamingContent])

  useEffect(() => {
    textareaRef.current?.focus()
  }, [])

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!input.trim() || isProcessing || !hasActiveAgent) return

      try {
        setStreamingContent('')
        await sendMessage(input, (chunk: string) => {
          setStreamingContent(prev => prev + chunk)
        })
        setInput('')
        setSelectedCommand('')
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto'
        }
      } catch (err) {
        console.error('Failed to send message:', err)
      }
    },
    [input, isProcessing, hasActiveAgent, sendMessage]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        void handleSubmit(e as unknown as React.FormEvent)
      }
    },
    [handleSubmit]
  )

  const handleTextareaChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [])

  const handleCommandSelect = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const command = e.target.value as Command
    setSelectedCommand(command)
    setInput(command)
    textareaRef.current?.focus()
  }, [])

  const filteredMessages = useMemo(() => {
    return filterUser ? messages.filter(message => message.user === filterUser) : messages
  }, [messages, filterUser])

  const sortedMessages = useMemo(() => {
    return [...filteredMessages].sort((a, b) => {
      if (sortOrder === 'asc') {
        return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      } else {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      }
    })
  }, [filteredMessages, sortOrder])

  return (
    <div className="flex h-full flex-col" role="main">
      <div className="mb-4 flex justify-between p-4">
        <Button variant="outline" size="sm" onClick={scrollToBottom}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh Chat
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setFilterUser(filterUser ? null : 'user')}
        >
          <Filter className="mr-2 h-4 w-4" />
          {filterUser ? 'Clear Filter' : 'Filter by User'}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
        >
          {sortOrder === 'asc' ? (
            <SortAsc className="mr-2 h-4 w-4" />
          ) : (
            <SortDesc className="mr-2 h-4 w-4" />
          )}
          Sort by Time
        </Button>
      </div>
      <div
        className="flex-1 space-y-4 overflow-y-auto p-4"
        role="log"
        aria-live="polite"
        aria-label="Chat Messages"
      >
        {sortedMessages.length === 0 ? (
          <div className="text-muted-foreground mt-8 text-center">
            <p className="text-lg font-semibold">Welcome to Monkey One!</p>
            <p className="mt-2">
              {hasActiveAgent
                ? 'Start chatting to begin.'
                : 'Please select an agent from the sidebar to begin.'}
            </p>
            {hasActiveAgent && availableCommands?.length > 0 && (
              <div className="mt-4">
                <p className="mb-2 font-medium">Available Commands:</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {availableCommands.map(command => (
                    <Button
                      key={command}
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedCommand(command)
                        setInput(command)
                        textareaRef.current?.focus()
                      }}
                    >
                      {command}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            {sortedMessages.map(message => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {streamingContent && (
              <div className="bg-secondary/20 animate-pulse rounded-lg p-4">
                <p className="whitespace-pre-wrap">{streamingContent}</p>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {error && (
        <div
          className="border-destructive bg-destructive/10 mx-4 mb-4 border-l-4 p-4"
          role="alert"
          aria-live="assertive"
        >
          <p className="text-destructive">{error}</p>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-background border-t p-4"
        aria-label="Message Input Form"
      >
        <div className="flex gap-2">
          {hasActiveAgent && availableCommands?.length > 0 && (
            <Select
              value={selectedCommand}
              onChange={handleCommandSelect}
              className="w-[200px]"
              aria-label="Command Selection"
            >
              <option value="">Select command...</option>
              {availableCommands.map(command => (
                <option key={command} value={command}>
                  {command}
                </option>
              ))}
            </Select>
          )}
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder={hasActiveAgent ? 'Type a message...' : 'Select an agent to start chatting'}
            disabled={!hasActiveAgent || isProcessing}
            rows={1}
            className={cn(
              'max-h-[200px] min-h-[44px] flex-1 resize-none',
              'focus:ring-primary focus:ring-2 focus:outline-none',
              !hasActiveAgent && 'cursor-not-allowed opacity-50'
            )}
            aria-label="Message Input"
          />
          <Button
            type="submit"
            disabled={!input.trim() || isProcessing || !hasActiveAgent}
            className="h-11"
            aria-label={isProcessing ? 'Sending message...' : 'Send message'}
          >
            {isProcessing ? (
              <Loader className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
      </form>
    </div>
  )
})
