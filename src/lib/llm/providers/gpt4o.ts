import { LLMProvider } from './base';

export class GPT4oProvider extends LLMProvider {
  constructor(apiKey?: string) {
    super(apiKey);
  }

  getName(): string {
    return 'GPT-4o';
  }

  getModelName(): string {
    return 'gpt-4o-2024-11-06';
  }

  getCostPerToken(): number {
    return 0.0002;
  }

  isAvailable(): boolean {
    return !!this.apiKey;
  }

  async generateResponse(prompt: string) {
    throw new Error('Not implemented');
  }

  async generateStreamingResponse(prompt: string) {
    throw new Error('Not implemented');
  }
}