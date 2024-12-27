import { LLMProvider } from './base';

export class O1Provider extends LLMProvider {
  constructor(apiKey?: string) {
    super(apiKey);
  }

  getName(): string {
    return 'O1';
  }

  getModelName(): string {
    return 'o1-large';
  }

  getCostPerToken(): number {
    return 0.0001;
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
