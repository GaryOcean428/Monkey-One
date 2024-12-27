import { XAIProvider } from './xai';
import { GroqProvider } from './groq';
import { PerplexityProvider } from './perplexity';
import { QwenProvider } from './qwen';
import { GraniteProvider } from './granite';
import { LocalProvider } from './local';
import { LlamaProvider } from './llama';
import { GPT4oProvider } from './gpt4o';
import { ClaudeProvider } from './claude';
import { O1Provider } from './o1';
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
    this.activeProvider = 'local'; // Set local provider as default
  }

  private registerDefaultProviders() {
    const providers: LLMProvider[] = [
      // Local provider
      new LocalProvider(),
      // Cloud providers - only initialize if API keys are available
      ...(import.meta.env.VITE_LLAMA_API_KEY ? [new LlamaProvider(import.meta.env.VITE_LLAMA_API_KEY)] : []),
      ...(import.meta.env.VITE_OPENAI_API_KEY ? [new GPT4oProvider(import.meta.env.VITE_OPENAI_API_KEY)] : []),
      ...(import.meta.env.VITE_ANTHROPIC_API_KEY ? [new ClaudeProvider(import.meta.env.VITE_ANTHROPIC_API_KEY)] : []),
      ...(import.meta.env.VITE_O1_API_KEY ? [new O1Provider(import.meta.env.VITE_O1_API_KEY)] : [])
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

  async sendMessage(message: string, context?: Message[], options?: {
    useRag?: boolean;
    documents?: string[];
    maxTokens?: number;
  }): Promise<string> {
    const provider = this.getActiveProvider();
    return provider.sendMessage(message, context, options);
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const provider = this.getActiveProvider();
    if (!provider.generateEmbedding) {
      throw new Error('Current provider does not support embeddings');
    }
    return provider.generateEmbedding(text);
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
      throw new Error('Current provider does not support streaming');
    }
    return provider.streamResponse(message, onChunk, options);
  }
}

export const llmManager = new LLMManager();