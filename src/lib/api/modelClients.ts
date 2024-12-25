import { ModelConfig } from '../models';
import { TokenCounter, TokenCount } from '../utils/tokenCounter';
import { logger } from '../../utils/logger';

export interface ModelResponse {
  text: string;
  usage: TokenCount;
}

export interface ModelClientOptions {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
}

abstract class BaseModelClient {
  protected config: ModelConfig;
  protected apiKey: string;

  constructor(config: ModelConfig, apiKey: string) {
    this.config = config;
    this.apiKey = apiKey;
  }

  protected async validateInput(prompt: string): Promise<void> {
    if (!TokenCounter.validateContextLength(prompt, this.config.contextWindow)) {
      throw new Error(`Prompt exceeds maximum context length of ${this.config.contextWindow} tokens`);
    }
  }

  abstract generate(prompt: string, options: ModelClientOptions): Promise<ModelResponse>;
}

export class OpenAIClient extends BaseModelClient {
  async generate(prompt: string, options: ModelClientOptions): Promise<ModelResponse> {
    await this.validateInput(prompt);
    
    const response = await fetch('https://api.openai.com/v1/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: this.config.apiEndpoint,
        prompt,
        ...options
      })
    });

    const data = await response.json();
    return {
      text: data.choices[0].text,
      usage: data.usage
    };
  }
}

export class AnthropicClient extends BaseModelClient {
  async generate(prompt: string, options: ModelClientOptions): Promise<ModelResponse> {
    await this.validateInput(prompt);
    
    const response = await fetch('https://api.anthropic.com/v1/complete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey
      },
      body: JSON.stringify({
        model: this.config.apiEndpoint,
        prompt: `\n\nHuman: ${prompt}\n\nAssistant:`,
        ...options
      })
    });

    const data = await response.json();
    return {
      text: data.completion,
      usage: TokenCounter.getTokenCounts(prompt, data.completion)
    };
  }
}

export class PerplexityClient extends BaseModelClient {
  async generate(prompt: string, options: ModelClientOptions): Promise<ModelResponse> {
    await this.validateInput(prompt);
    
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: this.config.apiEndpoint,
        messages: [{ role: 'user', content: prompt }],
        ...options
      })
    });

    const data = await response.json();
    return {
      text: data.choices[0].message.content,
      usage: data.usage
    };
  }
}

export class GroqClient extends BaseModelClient {
  async generate(prompt: string, options: ModelClientOptions): Promise<ModelResponse> {
    await this.validateInput(prompt);
    
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: this.config.apiEndpoint,
        messages: [{ role: 'user', content: prompt }],
        ...options
      })
    });

    const data = await response.json();
    return {
      text: data.choices[0].message.content,
      usage: data.usage
    };
  }
}

export class QwenClient extends BaseModelClient {
  async generate(prompt: string, options: ModelClientOptions): Promise<ModelResponse> {
    await this.validateInput(prompt);
    
    const response = await fetch('https://api.qwen.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: this.config.apiEndpoint,
        messages: [{ role: 'user', content: prompt }],
        ...options
      })
    });

    const data = await response.json();
    return {
      text: data.choices[0].message.content,
      usage: TokenCounter.getTokenCounts(prompt, data.choices[0].message.content)
    };
  }
}

// Factory to create appropriate client based on provider
export function createModelClient(config: ModelConfig): BaseModelClient {
  const getApiKey = (provider: string): string => {
    const key = process.env[`VITE_${provider.toUpperCase()}_API_KEY`];
    if (!key) throw new Error(`API key not found for provider: ${provider}`);
    return key;
  };

  switch (config.provider.toLowerCase()) {
    case 'openai':
      return new OpenAIClient(config, getApiKey('openai'));
    case 'anthropic':
      return new AnthropicClient(config, getApiKey('anthropic'));
    case 'perplexity':
      return new PerplexityClient(config, getApiKey('perplexity'));
    case 'groq':
      return new GroqClient(config, getApiKey('groq'));
    case 'qwen':
      return new QwenClient(config, getApiKey('qwen'));
    default:
      throw new Error(`Unsupported provider: ${config.provider}`);
  }
}
