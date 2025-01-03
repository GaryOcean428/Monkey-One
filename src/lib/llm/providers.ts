import { EventEmitter } from 'events'

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
}

export interface LLMProvider {
  name: string
  sendMessage(content: string, context: Message[], options?: LLMOptions): Promise<string>
  sendStreamingMessage(
    content: string,
    context: Message[],
    options?: LLMOptions
  ): AsyncGenerator<string>
}

export class OllamaProvider implements LLMProvider {
  name = 'ollama'

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
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'phi',
          prompt: this.formatPrompt(content, context, options),
          stream: false,
          options: {
            temperature: options?.temperature ?? 0.7,
            num_predict: options?.maxTokens ?? 1000,
          },
        }),
      })

      const data = await response.json()
      return data.response
    } catch (error) {
      console.error('Ollama API error:', error)
      throw error
    }
  }

  async *sendStreamingMessage(
    content: string,
    context: Message[],
    options?: LLMOptions
  ): AsyncGenerator<string> {
    try {
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'phi',
          prompt: this.formatPrompt(content, context, options),
          stream: true,
          options: {
            temperature: options?.temperature ?? 0.7,
            num_predict: options?.maxTokens ?? 1000,
          },
        }),
      })

      const reader = response.body?.getReader()
      if (!reader) throw new Error('Failed to get response reader')

      const decoder = new TextDecoder()
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n').filter(Boolean)

        for (const line of lines) {
          const data = JSON.parse(line)
          if (data.response) {
            yield data.response
          }
        }
      }
    } catch (error) {
      console.error('Ollama streaming error:', error)
      throw error
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
