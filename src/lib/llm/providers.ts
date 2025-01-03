import { EventEmitter } from '../utils/EventEmitter'

// Use node-fetch in Node.js environment
declare const fetch: typeof globalThis.fetch

export interface Message {
  role: 'user' | 'assistant'
  content: string
}

export interface LLMOptions {
  useRag?: boolean
  documents?: string[]
  temperature?: number
  maxTokens?: number
  apiKey?: string
}

export interface RateLimitConfig {
  maxRequestsPerMinute: number
  maxTokensPerMinute: number
  maxRequestsPerDay: number
}

export interface LLMProvider {
  name: string
  rateLimits: RateLimitConfig
  sendMessage(content: string, context: Message[], options?: LLMOptions): Promise<string>
  sendStreamingMessage(
    content: string,
    context: Message[],
    options?: LLMOptions
  ): AsyncGenerator<string>
}

export class OllamaProvider implements LLMProvider {
  name = 'ollama'
  private requestCount = { minute: 0, day: 0 }
  private tokenCount = { minute: 0 }
  private lastReset = { minute: Date.now(), day: Date.now() }

  rateLimits: RateLimitConfig = {
    maxRequestsPerMinute: 10,
    maxTokensPerMinute: 4000000,
    maxRequestsPerDay: 1500,
  }

  private resetRateLimits() {
    const now = Date.now()
    if (now - this.lastReset.minute >= 60000) {
      this.requestCount.minute = 0
      this.tokenCount.minute = 0
      this.lastReset.minute = now
    }
    if (now - this.lastReset.day >= 86400000) {
      this.requestCount.day = 0
      this.lastReset.day = now
    }
  }

  private checkRateLimits(estimatedTokens: number) {
    this.resetRateLimits()
    if (this.requestCount.minute >= this.rateLimits.maxRequestsPerMinute) {
      throw new Error('Rate limit exceeded: Too many requests per minute')
    }
    if (this.tokenCount.minute + estimatedTokens > this.rateLimits.maxTokensPerMinute) {
      throw new Error('Rate limit exceeded: Token limit per minute exceeded')
    }
    if (this.requestCount.day >= this.rateLimits.maxRequestsPerDay) {
      throw new Error('Rate limit exceeded: Daily request limit exceeded')
    }
  }

  private updateRateLimits(estimatedTokens: number) {
    this.requestCount.minute++
    this.requestCount.day++
    this.tokenCount.minute += estimatedTokens
  }

  private formatPrompt(content: string, context: Message[], options?: LLMOptions): string {
    let prompt = ''

    if (context.length > 0) {
      prompt += 'Previous conversation:\n'
      context.forEach(msg => {
        prompt += `${msg.role}: ${msg.content}\n`
      })
      prompt += '\n'
    }

    if (options?.useRag && options.documents?.length) {
      prompt += 'Relevant context:\n'
      options.documents.forEach(doc => {
        prompt += `${doc}\n`
      })
      prompt += '\n'
    }

    prompt += `User: ${content}\nAssistant:`
    return prompt
  }

  async sendMessage(content: string, context: Message[], options?: LLMOptions): Promise<string> {
    try {
      const estimatedTokens = Math.ceil((content.length + JSON.stringify(context).length) / 4)
      this.checkRateLimits(estimatedTokens)

      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${options?.apiKey}`,
        },
        body: JSON.stringify({
          model: 'granite3.1-dense:2b',
          prompt: this.formatPrompt(content, context, options),
          stream: false,
          options: {
            temperature: options?.temperature ?? 0.7,
            num_predict: options?.maxTokens ?? 1000,
          },
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      this.updateRateLimits(estimatedTokens)
      return data.response
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Ollama API error: ${error.message}`)
      }
      throw new Error('Unknown error occurred while calling Ollama API')
    }
  }

  async *sendStreamingMessage(
    content: string,
    context: Message[],
    options?: LLMOptions
  ): AsyncGenerator<string> {
    try {
      const estimatedTokens = Math.ceil((content.length + JSON.stringify(context).length) / 4)
      this.checkRateLimits(estimatedTokens)

      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${options?.apiKey}`,
        },
        body: JSON.stringify({
          model: 'granite3.1-dense:2b',
          prompt: this.formatPrompt(content, context, options),
          stream: true,
          options: {
            temperature: options?.temperature ?? 0.7,
            num_predict: options?.maxTokens ?? 1000,
          },
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error('Failed to get response reader')

      this.updateRateLimits(estimatedTokens)
      const decoder = new TextDecoder()

      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split('\n').filter(Boolean)

          for (const line of lines) {
            try {
              const data = JSON.parse(line)
              if (data.response) {
                yield data.response
              }
            } catch (parseError) {
              console.error('Error parsing streaming response:', parseError)
              continue
            }
          }
        }
      } finally {
        reader.releaseLock()
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Ollama streaming error: ${error.message}`)
      }
      throw new Error('Unknown error occurred while streaming from Ollama API')
    }
  }
}

export class LLMManager extends EventEmitter {
  private provider: LLMProvider

  constructor() {
    super()
    this.provider = new OllamaProvider()
  }

  async sendMessage(
    content: string,
    context: Message[] = [],
    options?: LLMOptions
  ): Promise<string> {
    return this.provider.sendMessage(content, context, options)
  }

  async *sendStreamingMessage(
    content: string,
    context: Message[] = [],
    options?: LLMOptions
  ): AsyncGenerator<string> {
    yield* this.provider.sendStreamingMessage(content, context, options)
  }

  getActiveProvider(): LLMProvider {
    return this.provider
  }
}

export const llmManager = new LLMManager()
