import { HfInference } from '@huggingface/inference';

const hf = new HfInference(import.meta.env.VITE_HUGGINGFACE_TOKEN);

export interface ModelConfig {
  id: string;
  name: string;
  provider: 'meta' | 'anthropic' | 'groq';
  modelId: string;
  contextWindow: number;
  maxOutputTokens: number;
  temperature?: number;
  topP?: number;
  capabilities?: {
    vision?: boolean;
    code?: boolean;
    tools?: boolean;
    retrieval?: boolean;
  };
}

export const models: Record<string, ModelConfig> = {
  // Meta LLaMA Models
  'llama-3.3-70b': {
    id: 'llama-3.3-70b',
    name: 'LLaMA 3.3 70B',
    provider: 'meta',
    modelId: 'llama-3.3-70b-specdec',
    contextWindow: 8192,
    maxOutputTokens: 4096,
    temperature: 0.7,
    topP: 0.9,
    capabilities: {
      code: true,
      tools: true,
    },
  },
  'llama-3.1-70b': {
    id: 'llama-3.1-70b',
    name: 'LLaMA 3.1 70B',
    provider: 'meta',
    modelId: 'llama-3.1-70b-specdec',
    contextWindow: 8192,
    maxOutputTokens: 4096,
    temperature: 0.7,
    topP: 0.9,
    capabilities: {
      code: true,
      tools: true,
    },
  },
  'llama-3.2-1b': {
    id: 'llama-3.2-1b',
    name: 'LLaMA 3.2 1B',
    provider: 'meta',
    modelId: 'llama-3.2-1b-preview',
    contextWindow: 128000,
    maxOutputTokens: 8192,
    temperature: 0.7,
    topP: 0.9,
    capabilities: {
      code: true,
      tools: true,
    },
  },
  'llama-3.2-3b': {
    id: 'llama-3.2-3b',
    name: 'LLaMA 3.2 3B',
    provider: 'meta',
    modelId: 'llama-3.2-3b-preview',
    contextWindow: 128000,
    maxOutputTokens: 8192,
    temperature: 0.7,
    topP: 0.9,
    capabilities: {
      code: true,
      tools: true,
    },
  },
  'llama-3.2-11b-vision': {
    id: 'llama-3.2-11b-vision',
    name: 'LLaMA 3.2 11B Vision',
    provider: 'meta',
    modelId: 'llama-3.2-11b-vision-preview',
    contextWindow: 128000,
    maxOutputTokens: 8192,
    temperature: 0.7,
    topP: 0.9,
    capabilities: {
      vision: true,
      code: true,
      tools: true,
    },
  },
  'llama-3.2-90b-vision': {
    id: 'llama-3.2-90b-vision',
    name: 'LLaMA 3.2 90B Vision',
    provider: 'meta',
    modelId: 'llama-3.2-90b-vision-preview',
    contextWindow: 128000,
    maxOutputTokens: 8192,
    temperature: 0.7,
    topP: 0.9,
    capabilities: {
      vision: true,
      code: true,
      tools: true,
    },
  },

  // Anthropic Models
  'claude-3.5-sonnet': {
    id: 'claude-3.5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'anthropic',
    modelId: 'claude-3-5-sonnet-20241022',
    contextWindow: 200000,
    maxOutputTokens: 4096,
    temperature: 0.7,
    topP: 0.9,
    capabilities: {
      code: true,
      tools: true,
    },
  },
  'claude-3.5-haiku': {
    id: 'claude-3.5-haiku',
    name: 'Claude 3.5 Haiku',
    provider: 'anthropic',
    modelId: 'claude-3-5-haiku-20241022',
    contextWindow: 200000,
    maxOutputTokens: 4096,
    temperature: 0.7,
    topP: 0.9,
    capabilities: {
      code: true,
      tools: true,
    },
  },

  // Groq LLaMA Models
  'llama3-groq-70b': {
    id: 'llama3-groq-70b',
    name: 'LLaMA 3 Groq 70B',
    provider: 'groq',
    modelId: 'llama3-groq-70b-8192-tool-use-preview',
    contextWindow: 8192,
    maxOutputTokens: 4096,
    temperature: 0.7,
    topP: 0.9,
    capabilities: {
      code: true,
      tools: true,
    },
  },
  'llama3-groq-8b': {
    id: 'llama3-groq-8b',
    name: 'LLaMA 3 Groq 8B',
    provider: 'groq',
    modelId: 'llama3-groq-8b-8192-tool-use-preview',
    contextWindow: 8192,
    maxOutputTokens: 4096,
    temperature: 0.7,
    topP: 0.9,
    capabilities: {
      code: true,
      tools: true,
    },
  },
};

export async function generateText(
  model: ModelConfig,
  prompt: string,
  options: {
    temperature?: number;
    maxTokens?: number;
    stopSequences?: string[];
    tools?: any[];
    toolChoice?: string | null;
  } = {}
): Promise<string> {
  switch (model.provider) {
    case 'meta': {
      const response = await fetch('https://api.meta.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_META_API_KEY}`,
        },
        body: JSON.stringify({
          model: model.modelId,
          messages: [{ role: 'user', content: prompt }],
          max_tokens: options.maxTokens || model.maxOutputTokens,
          temperature: options.temperature || model.temperature,
          tools: options.tools,
          tool_choice: options.toolChoice,
        }),
      });
      const data = await response.json();
      return data.choices[0].message.content;
    }

    case 'anthropic': {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': import.meta.env.VITE_ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: model.modelId,
          messages: [{ role: 'user', content: prompt }],
          max_tokens: options.maxTokens || model.maxOutputTokens,
          temperature: options.temperature || model.temperature,
          system: "You are an AI assistant helping with code and development tasks.",
          tools: options.tools,
          tool_choice: options.toolChoice,
        }),
      });
      const data = await response.json();
      return data.content[0].text;
    }

    case 'groq': {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: model.modelId,
          messages: [{ role: 'user', content: prompt }],
          max_tokens: options.maxTokens || model.maxOutputTokens,
          temperature: options.temperature || model.temperature,
          tools: options.tools,
          tool_choice: options.toolChoice,
        }),
      });
      const data = await response.json();
      return data.choices[0].message.content;
    }

    default:
      throw new Error(`Unknown model provider: ${model.provider}`);
  }
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await hf.featureExtraction({
    model: 'sentence-transformers/all-MiniLM-L6-v2',
    inputs: text,
  });
  return Array.isArray(response) ? response : [response];
}

// Export default model
export const defaultModel = models['llama-3.3-70b'];
