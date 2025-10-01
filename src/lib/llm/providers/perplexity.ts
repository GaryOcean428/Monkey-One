// Forward declaration to avoid circular dependency
import type { Message } from '../../../types'

export interface LLMProvider {
  id: string
  name: string
  sendMessage(
    message: string,
    context?: Message[],
    options?: {
      useRag?: boolean
      documents?: string[]
      maxTokens?: number
    }
  ): Promise<string>
  streamResponse?(
    message: string,
    onChunk: (chunk: string) => void,
    options?: {
      useRag?: boolean
      documents?: string[]
      maxTokens?: number
    }
  ): Promise<void>
}
import type { Message } from '../../../types'

// Use global fetch for API requests
declare const fetch: typeof globalThis.fetch

export class PerplexityProvider implements LLMProvider {
  readonly id = 'perplexity'
  readonly name = 'Perplexity'
  readonly models = {
    sonarSmall: 'llama-3.1-sonar-small-128k-online',
    sonarLarge: 'llama-3.1-sonar-large-128k-online',
    sonarHuge: 'llama-3.1-sonar-huge-128k-online',
  } as const

  constructor(private apiKey: string) {}

  async sendMessage(message: string, context: Message[] = []): Promise<string> {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        messages: [
          ...context.map(msg => ({
            role: msg.role,
            content: msg.content,
          })),
          { role: 'user', content: message },
        ],
        model: this.models.sonarHuge,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.statusText}`)
    }

    const data = await response.json()
    return data.choices[0].message.content
  }
}
