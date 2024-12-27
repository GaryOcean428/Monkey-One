import { LLMProvider, LLMResponse } from './base';

export class LocalProvider extends LLMProvider {
  private modelName: string;
  private isInitialized: boolean = false;

  constructor(modelName: string = 'gpt-4o-2024-11-06') {
    super();
    this.modelName = modelName;
  }

  getName(): string {
    return 'Local';
  }

  getModelName(): string {
    return this.modelName;
  }

  getCostPerToken(): number {
    return 0; // Local models don't have a cost per token
  }

  async initialize(): Promise<void> {
    // Initialize local model here
    this.isInitialized = true;
  }

  isAvailable(): boolean {
    return this.isInitialized;
  }

  async generateResponse(prompt: string): Promise<LLMResponse> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    // Mock response for testing
    return {
      text: `Response from ${this.modelName}: ${prompt}`,
      usage: {
        promptTokens: prompt.length,
        completionTokens: 50,
        totalTokens: prompt.length + 50
      }
    };
  }

  async generateStreamingResponse(prompt: string): Promise<ReadableStream> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    // Create a ReadableStream that yields the response in chunks
    return new ReadableStream({
      async start(controller) {
        const response = `Response from ${prompt}`;
        const encoder = new TextEncoder();
        
        // Split response into chunks and send
        const chunkSize = 10;
        for (let i = 0; i < response.length; i += chunkSize) {
          const chunk = response.slice(i, i + chunkSize);
          controller.enqueue(encoder.encode(chunk));
          await new Promise(resolve => setTimeout(resolve, 100)); // Simulate delay
        }
        
        controller.close();
      }
    });
  }
}
