import type { LLMProvider } from './index';
import type { Message } from '@/types';
import { HfInference } from '@huggingface/inference';

export class QwenProvider implements LLMProvider {
  readonly id = 'qwen';
  readonly name = 'Qwen';
  readonly model = 'Qwen/Qwen2.5-Coder-32B-Instruct';
  private client: HfInference;

  constructor(private token: string) {
    this.client = new HfInference(token);
  }

  async sendMessage(message: string, context: Message[] = []): Promise<string> {
    try {
      const response = await this.client.textGeneration({
        model: this.model,
        inputs: [
          ...context.map(msg => `${msg.role}: ${msg.content}`).join('\n'),
          `user: ${message}`
        ].join('\n'),
        parameters: {
          max_new_tokens: 2000,
          temperature: 0.3,
          top_p: 0.9,
          repetition_penalty: 1.1
        }
      });

      return response.generated_text;
    } catch (error) {
      throw new Error(`Qwen API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async streamResponse(message: string, onChunk: (chunk: string) => void): Promise<void> {
    const stream = await this.client.textGenerationStream({
      model: this.model,
      inputs: message,
      parameters: {
        max_new_tokens: 2000,
        temperature: 0.3,
        top_p: 0.9,
        repetition_penalty: 1.1
      }
    });

    for await (const chunk of stream) {
      onChunk(chunk.token.text);
    }
  }
}