import React, { useState, useRef, useEffect } from 'react'
import { useToast } from '../ui/use-toast'
import { z } from 'zod'
import { Button } from '../ui/button'
import { Textarea } from '../ui/textarea'
import { Card } from '../ui/card'
import { LoadingSpinner } from '../ui/loading-spinner'
import { generateStructuredData, streamAIResponse } from '@/lib/ai'
import { marked } from 'marked'
import { RefreshCw, Filter, SortAsc, SortDesc } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export function AIStreamingChat() {
  const [prompt, setPrompt] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamedResponse, setStreamedResponse] = useState('')
  const [filterUser, setFilterUser] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamedResponse])

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!prompt.trim()) return

    // Add user message to chat
    const userMessage = { role: 'user', content: prompt }
    setMessages(prev => [...prev, userMessage])

    try {
      setIsLoading(true)
      setIsStreaming(true)
      setStreamedResponse('')

      // Get stream from API
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          system: 'You are a helpful AI assistant that provides clear, accurate answers.',
          stream: true,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get streaming response')
      }

      // Read the stream
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error('Failed to get response reader')
      }

      let done = false
      let accumulated = ''

      while (!done) {
        const { value, done: doneReading } = await reader.read()
        done = doneReading

        if (value) {
          const chunk = decoder.decode(value, { stream: true })
          accumulated += chunk
          setStreamedResponse(accumulated)
        }
      }

      // Add the complete assistant message to chat
      setMessages(prev => [...prev, { role: 'assistant', content: accumulated }])
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to get AI response',
        variant: 'destructive',
      })
      console.error('Error getting AI response:', error)
    } finally {
      setIsLoading(false)
      setIsStreaming(false)
      setStreamedResponse('')
      setPrompt('')
    }
  }

  // Generate structured data example
  const generateSentimentAnalysis = async () => {
    try {
      setIsLoading(true)

      // Define schema for the structured output
      const schema = z.object({
        sentiment: z.enum(['positive', 'neutral', 'negative']),
        confidence: z.number().min(0).max(1),
        summary: z.string(),
        keywords: z.array(z.string()),
      })

      // Generate structured data
      const result = await generateStructuredData({
        prompt:
          prompt ||
          'Analyze the sentiment of this text: "I really enjoyed the new product experience, though there were a few minor issues."',
        schema,
        systemPrompt:
          'You are a sentiment analysis assistant. Analyze the given text and return structured data about its sentiment.',
      })

      // Add the result to chat
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: `**Sentiment Analysis Results**:
          
- **Sentiment**: ${result.sentiment}
- **Confidence**: ${(result.confidence * 100).toFixed(2)}%
- **Summary**: ${result.summary}
- **Keywords**: ${result.keywords.join(', ')}`,
        },
      ])
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate sentiment analysis',
        variant: 'destructive',
      })
      console.error('Error generating sentiment analysis:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const refreshChat = () => {
    setMessages([])
    setStreamedResponse('')
  }

  const filteredMessages = filterUser
    ? messages.filter(message => message.role === filterUser)
    : messages

  const sortedMessages = filteredMessages.sort((a, b) => {
    if (sortOrder === 'asc') {
      return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    } else {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    }
  })

  return (
    <div className="mx-auto flex max-w-3xl flex-col space-y-4">
      <h2 className="text-2xl font-bold">AI Chat with Streaming</h2>

      {/* Chat Messages */}
      <Card className="max-h-[500px] overflow-y-auto p-4">
        <div className="space-y-4">
          {sortedMessages.length === 0 ? (
            <p className="text-muted-foreground text-center">
              Send a message to start chatting with the AI assistant.
            </p>
          ) : (
            sortedMessages.map((message, i) => (
              <div
                key={i}
                className={`rounded-lg p-3 ${
                  message.role === 'user'
                    ? 'bg-primary/10 ml-auto max-w-[80%]'
                    : 'bg-secondary/10 mr-auto max-w-[80%]'
                }`}
              >
                <div
                  className="prose dark:prose-invert"
                  dangerouslySetInnerHTML={{
                    __html: marked(message.content),
                  }}
                />
              </div>
            ))
          )}

          {/* Streaming response */}
          {isStreaming && streamedResponse && (
            <div className="bg-secondary/10 mr-auto max-w-[80%] rounded-lg p-3">
              <div
                className="prose dark:prose-invert"
                dangerouslySetInnerHTML={{
                  __html: marked(streamedResponse),
                }}
              />
            </div>
          )}

          {/* Auto-scroll anchor */}
          <div ref={messagesEndRef} />
        </div>
      </Card>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="space-y-2">
        <Textarea
          placeholder="Ask something..."
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          disabled={isLoading}
          className="min-h-[100px]"
        />

        <div className="flex space-x-2">
          <Button type="submit" disabled={isLoading || !prompt.trim()} className="flex-1">
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Processing...
              </>
            ) : (
              'Send Message'
            )}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={generateSentimentAnalysis}
            disabled={isLoading}
          >
            Generate Sentiment Analysis
          </Button>
        </div>
      </form>

      <div className="mb-4 flex justify-between">
        <Button variant="outline" size="sm" onClick={refreshChat}>
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
    </div>
  )
}
