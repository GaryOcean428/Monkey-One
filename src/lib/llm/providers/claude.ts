import { LLMProvider } from './base'

export class ClaudeProvider extends LLMProvider {
  constructor(apiKey?: string) {
    super(apiKey)
  }

  getName(): string {
    return 'Claude'
  }

  getModelName(): string {
    return 'claude-3.7-sonnet'
  }

  getCostPerToken(): number {
    return 0.00015
  }

  isAvailable(): boolean {
    return !!this.apiKey
  }

  async generateResponse(_prompt: string) {
    throw new Error('Not implemented')
  }

  async generateStreamingResponse(_prompt: string) {
    throw new Error('Not implemented')
  }
}
