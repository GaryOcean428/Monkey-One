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
import { HfInference } from '@huggingface/inference'

export class GraniteProvider implements LLMProvider {
  readonly id = 'granite'
  readonly name = 'IBM Granite'
  readonly model = 'ibm-granite/granite-3.0-2b-instruct'
  private client: HfInference

  constructor(private token: string) {
    this.client = new HfInference(token)
  }

  async sendMessage(
    message: string,
    context: Message[] = [],
    options?: {
      useRag?: boolean
      documents?: string[]
      maxTokens?: number
    }
  ): Promise<string> {
    try {
      let prompt = ''

      if (options?.useRag && options.documents?.length) {
        // Format context using RAG-optimized prompting
        prompt = this.formatRagPrompt(message, context, options.documents)
      } else {
        prompt = this.formatChatPrompt(message, context)
      }

      const response = await this.client.textGeneration({
        model: this.model,
        inputs: prompt,
        parameters: {
          max_new_tokens: options?.maxTokens || 1000,
          temperature: 0.7,
          top_p: 0.9,
          repetition_penalty: 1.1,
          do_sample: true,
          return_full_text: false,
        },
      })

      return response.generated_text
    } catch (error) {
      throw new Error(
        `Granite API error: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  private formatChatPrompt(message: string, context: Message[]): string {
    const formattedMessages = context.map(msg => {
      const role = msg.role === 'assistant' ? 'Assistant' : msg.role === 'user' ? 'User' : 'System'
      return `${role}: ${msg.content}`
    })

    formattedMessages.push(`User: ${message}`)
    return formattedMessages.join('\n')
  }

  private formatRagPrompt(query: string, context: Message[], documents: string[]): string {
    const contextStr = context
      .map(msg => {
        const role =
          msg.role === 'assistant' ? 'Assistant' : msg.role === 'user' ? 'User' : 'System'
        return `${role}: ${msg.content}`
      })
      .join('\n')

    const docsStr = documents.map((doc, i) => `[Document ${i + 1}]:\n${doc}`).join('\n\n')

    return `System: You are a helpful AI assistant. Use the following documents and conversation history to provide accurate and relevant responses. If the documents don't contain enough information, use your general knowledge while clearly indicating what information comes from where.

Context:
${contextStr}

Relevant Documents:
${docsStr}

Task: Based on the above documents and context, answer the following query:
${query}

Response:`
  }

  async streamResponse(
    message: string,
    onChunk: (chunk: string) => void,
    options?: {
      useRag?: boolean
      documents?: string[]
      maxTokens?: number
    }
  ): Promise<void> {
    const prompt =
      options?.useRag && options.documents?.length
        ? this.formatRagPrompt(message, [], options.documents)
        : this.formatChatPrompt(message, [])

    const stream = await this.client.textGenerationStream({
      model: this.model,
      inputs: prompt,
      parameters: {
        max_new_tokens: options?.maxTokens || 1000,
        temperature: 0.7,
        top_p: 0.9,
        repetition_penalty: 1.1,
        do_sample: true,
        return_full_text: false,
      },
    })

    for await (const chunk of stream) {
      onChunk(chunk.token.text)
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await this.client.featureExtraction({
        model: 'sentence-transformers/all-MiniLM-L6-v2',
        inputs: text,
      })

      if (Array.isArray(response)) {
        const flattened = response.flat()
        if (flattened.every(item => typeof item === 'number')) {
          return flattened
        }
      }

      console.warn('Unexpected embedding format:', response)
      return []
    } catch (error) {
      console.error('Error generating embedding:', error)
      return []
    }
  }
}
