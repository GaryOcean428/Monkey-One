import type { LLMProvider } from './index';
import type { Message } from '@/types';
import { HfInference } from '@huggingface/inference';

export class GraniteProvider implements LLMProvider {
  readonly id = 'granite';
  readonly name = 'IBM Granite';
  readonly model = 'ibm-granite/granite-3.0-2b-instruct';
  private client: HfInference;

  constructor(private token: string) {
    this.client = new HfInference(token);
  }

  async sendMessage(message: string, context: Message[] = [], options?: {
    useRag?: boolean;
    documents?: string[];
    maxTokens?: number;
  }): Promise<string> {
    try {
      let prompt = '';
      
      if (options?.useRag && options.documents?.length) {
        // Format context using RAG-optimized prompting
        prompt = this.formatRagPrompt(message, context, options.documents);
      } else {
        const chat = context.map(msg => ({
          role: msg.role,
          content: msg.content
        }));
        chat.push({ role: 'user', content: message });
        prompt = this.client.tokenizer.apply_chat_template(chat, false, true);
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
          return_full_text: false
        }
      });

      return response.generated_text;
    } catch (error) {
      throw new Error(`Granite API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private formatRagPrompt(query: string, context: Message[], documents: string[]): string {
    const contextStr = context
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n');

    const docsStr = documents
      .map((doc, i) => `[Document ${i + 1}]:\n${doc}`)
      .join('\n\n');

    return `System: You are a helpful AI assistant. Use the following documents and conversation history to provide accurate and relevant responses. If the documents don't contain enough information, use your general knowledge while clearly indicating what information comes from where.

Context:
${contextStr}

Relevant Documents:
${docsStr}

Task: Based on the above documents and context, answer the following query:
${query}

Response:`;
  }

  async streamResponse(message: string, onChunk: (chunk: string) => void, options?: {
    useRag?: boolean;
    documents?: string[];
    maxTokens?: number;
  }): Promise<void> {
    const stream = await this.client.textGenerationStream({
      model: this.model,
      inputs: options?.useRag && options.documents?.length
        ? this.formatRagPrompt(message, [], options.documents)
        : message,
      parameters: {
        max_new_tokens: options?.maxTokens || 1000,
        temperature: 0.7,
        top_p: 0.9,
        repetition_penalty: 1.1,
        do_sample: true,
        return_full_text: false
      }
    });

    for await (const chunk of stream) {
      onChunk(chunk.token.text);
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const response = await this.client.featureExtraction({
      model: 'sentence-transformers/all-MiniLM-L6-v2',
      inputs: text
    });

    return Array.isArray(response) ? response : [];
  }
}