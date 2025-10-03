import { LLMProvider } from './base'

export class LlamaProvider extends LLMProvider {
  constructor(apiKey?: string) {
    super(apiKey)
  }

  getName(): string {
    return 'Llama'
  }

  getModelName(): string {
    return 'llama-2-70b'
  }

  getCostPerToken(): number {
    return 0.0001
  }

  isAvailable(): boolean {
    return !!this.apiKey
  }

  async generateResponse(prompt: string) {
    throw new Error('Not implemented')
  }

  async generateStreamingResponse(prompt: string) {
    throw new Error('Not implemented')
  }
}
