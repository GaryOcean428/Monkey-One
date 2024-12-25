import { XAIProvider } from './xai';
import { GroqProvider } from './groq';
import { PerplexityProvider } from './perplexity';
import { QwenProvider } from './qwen';
import { GraniteProvider } from './granite';
import type { Message } from '../../../types';

export interface LLMProvider {
  id: string;
  name: string;
  sendMessage(message: string, context?: Message[], options?: {
    useRag?: boolean;
    documents?: string[];
    maxTokens?: number;
  }): Promise<string>;
  generateEmbedding?(text: string): Promise<number[]>;
  streamResponse?(
    message: string,
    onChunk: (chunk: string) => void,
    options?: {
      useRag?: boolean;
      documents?: string[];
      maxTokens?: number;
    }
  ): Promise<void>;
}

class LLMManager {
  private providers: Map<string, LLMProvider> = new Map();
  private activeProvider: string;

  constructor() {
    this.registerDefaultProviders();
    this.activeProvider = 'phi3.5'; // Set Phi 3.5 as default for local inference
  }

  private registerDefaultProviders() {
    const providers: LLMProvider[] = [
      // Local provider
      new LocalProvider(),
      // Cloud providers
      new LlamaProvider(import.meta.env.VITE_LLAMA_API_KEY),
      new GPT4oProvider(import.meta.env.VITE_OPENAI_API_KEY),
      new ClaudeProvider(import.meta.env.VITE_ANTHROPIC_API_KEY),
      new O1Provider(import.meta.env.VITE_O1_API_KEY)
    ];

    providers.forEach(provider => {
      this.providers.set(provider.id, provider);
    });
  }

  setActiveProvider(providerId: string) {
    if (!this.providers.has(providerId)) {
      throw new Error(`Provider ${providerId} not found`);
    }
    this.activeProvider = providerId;
  }

  getActiveProvider(): LLMProvider {
    const provider = this.providers.get(this.activeProvider);
    if (!provider) {
      throw new Error('No active provider set');
    }
    return provider;
  }

  async sendMessage(
    message: string,
    context?: Message[],
    options?: {
      useRag?: boolean;
      documents?: string[];
      maxTokens?: number;
    }
  ): Promise<string> {
    return this.getActiveProvider().sendMessage(message, context, options);
  }

  async streamResponse(
    message: string,
    onChunk: (chunk: string) => void,
    options?: {
      useRag?: boolean;
      documents?: string[];
      maxTokens?: number;
    }
  ): Promise<void> {
    const provider = this.getActiveProvider();
    if (!provider.streamResponse) {
      throw new Error('Active provider does not support streaming');
    }
    return provider.streamResponse(message, onChunk, options);
  }
}

export const llmManager = new LLMManager();