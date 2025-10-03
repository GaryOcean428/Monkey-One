import type { LLMProvider } from './index'
import type { Message } from '../../../types'

export class HuggingFaceProvider implements LLMProvider {
  readonly id = 'huggingface'
  readonly name = 'HuggingFace'

  constructor(private token: string) {}

  async sendMessage(message: string, context: Message[] = []): Promise<string> {
    const response = await fetch(
      'https://api-inference.huggingface.co/models/mistralai/Mixtral-8x7B-Instruct-v0.1',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.token}`,
        },
        body: JSON.stringify({
          inputs: [
            ...context.map(msg => `${msg.role}: ${msg.content}`).join('\n'),
            `user: ${message}`,
          ].join('\n'),
        }),
      }
    )

    if (!response.ok) {
      throw new Error(`HuggingFace API error: ${response.statusText}`)
    }

    const data = await response.json()
    return data[0].generated_text
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const response = await fetch(
      'https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.token}`,
        },
        body: JSON.stringify({ inputs: text }),
      }
    )

    if (!response.ok) {
      throw new Error(`HuggingFace API error: ${response.statusText}`)
    }

    const data = await response.json()
    return data[0]
  }
}
