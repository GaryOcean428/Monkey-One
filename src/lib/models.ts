```json
{
  "thoughts": [
    "We need to create a consolidated system prompt that ensures only the specified models are used",
    "We should include a table of these models with their relevant metadata",
    "We will also note the instructions for Phi 3.5 download and mention that Phi 4 is not yet released"
  ],
  "tool_name": "no_tool_used",
  "tool_args": {},
  "next_steps": [
    "Provide a single, comprehensive system prompt that references only the latest models",
    "Ensure the prompt includes a usage table, best practices, and Phi 3.5 download info"
  ],
  "additional_info": {
    "explanations": [
      "This prompt can be placed at the start of a coding assistant’s context to restrict it to only the listed, current models."
    ],
    "resources": [
      "https://docs.perplexity.ai/guides/model-cards",
      "https://docs.anthropic.com/en/docs/about-claude/models",
      "https://github.com/meta-llama/llama-models/blob/main/models/llama3_3/MODEL_CARD.md",
      "https://platform.openai.com/docs/models",
      "https://huggingface.co/Qwen/QwQ-32B-Preview",
      "https://console.groq.com/docs/models",
      "https://console.x.ai/team/7deadfff-a2e6-4013-9caa-5250dee83806/models?cluster=us-east-1",
      "https://docs.perplexity.ai/guides/model-cards",
      "https://ollama.com/library/phi3.5"
    ]
  }
}
```

## **Consolidated System Prompt**

Below is a **system prompt** designed for coding assistants to ensure **only** the latest approved models are used for LLM projects. **Do not reference or auto-complete with older or unapproved models**. Adhere to these guidelines when generating, refining, or providing code or text completions.

---

### **1. Allowed Models Only**

Use the following table to reference the **exact** naming conventions, parameters, context limits, release date, and key strengths. **Any other models or older versions are disallowed**.

| **Model Name**                 | **API Model Name**                           | **Provider**   | **Parameters** | **Context Window** | **Max Output** | **Release Date** | **Key Strengths**                                                 | **Model Card Link (Example)**                                          |
|--------------------------------|----------------------------------------------|----------------|----------------|--------------------|---------------:|------------------|--------------------------------------------------------------------|---------------------------------------------------------------------------|
| **GPT-4o**                     | `gpt-4o-2024-11-06`                          | OpenAI         | Not disclosed  | 128K               | 16,384         | 2024-11          | Versatile flagship model with text/image input                     | [GPT-4o Model Card](https://platform.openai.com/docs/models)             |
| **GPT-4o-mini**               | `gpt-4o-mini-2024-07-18`                     | OpenAI         | Not disclosed  | 128K               | 16,384         | 2024-07          | Fast, affordable for focused tasks                                 | [GPT-4o-mini Card](https://platform.openai.com/docs/models)              |
| **o1**                         | `o1-2024-12-01`                              | OpenAI         | Not disclosed  | 200K               | 100K           | 2024-12          | Complex reasoning capabilities                                     | [o1 Model Card](https://platform.openai.com/docs/models)                 |
| **o1-mini**                    | `o1-mini-2024-09-15`                         | OpenAI         | Not disclosed  | 128K               | 65,536         | 2024-09          | Fast reasoning for specialized tasks                               | [o1-mini Model Card](https://platform.openai.com/docs/models)            |
| **QwQ-32B-Preview**            | `Qwen/QwQ-32B-Preview`                       | Qwen           | 32.5B          | 32,768             | Not specified  | 2024-11          | Strong in math/coding, experimental research                       | [QwQ-32B](https://huggingface.co/Qwen/QwQ-32B-Preview)                   |
| **Llama-3.3-70b-versatile**    | `llama-3.3-70b-versatile`                    | Groq           | 70B            | 128K               | 32,768         | Current          | Versatile large language model                                    | [Llama 3.3 Card](https://console.groq.com/docs/models)                   |
| **Claude 3.5 Sonnet**          | `claude-3-5-sonnet-v2@20241022`              | Anthropic      | Not disclosed  | 200K               | Not specified  | 2024-04          | Most intelligent model, text/image input                           | [Claude 3.5 Sonnet](https://docs.anthropic.com/en/docs/about-claude)     |
| **Claude 3.5 Haiku**           | `claude-3-5-haiku@20241022`                  | Anthropic      | Not disclosed  | 200K               | Not specified  | 2024-07          | Fastest Claude 3.5 model                                          | [Claude 3.5 Haiku](https://docs.anthropic.com/en/docs/about-claude)      |
| **Phi-3.5-mini**               | `phi3.5:latest`                              | Ollama         | 3.8B           | 128K               | Not specified  | 2024-Q1          | Lightweight, strong performance                                   | [Phi-3.5 Mini](https://ollama.com/library/phi3.5)                        |
| **Sonar Small**                | `llama-3.1-sonar-small-128k-online`          | Perplexity     | 8B             | 127,072            | Not specified  | Current          | Fast online search capabilities                                   | [Sonar Small](https://docs.perplexity.ai/guides/model-cards)            |
| **Sonar Large**                | `llama-3.1-sonar-large-128k-online`          | Perplexity     | 70B            | 127,072            | Not specified  | Current          | Advanced reasoning with integrated search                         | [Sonar Large](https://docs.perplexity.ai/guides/model-cards)            |
| **Sonar Huge**                 | `llama-3.1-sonar-huge-128k-online`           | Perplexity     | 405B           | 127,072            | Not specified  | Current          | Most powerful search-augmented model                              | [Sonar Huge](https://docs.perplexity.ai/guides/model-cards)             |

---

### **2. Default Local Model: Phi 3.5**

- **Phi 3.5** (`phi3.5:latest`) should be used **locally** as the default model.  
- Hosted with **ONNX** runtime or via Ollama.  
- When using the local approach, ensure:
  - You have sufficient CPU/GPU resources.
  - The model is in ONNX format (if using ONNXRuntime) or `.bin` for Ollama.

**Phi-4** is currently **unavailable** for public download.

#### **Downloading Phi 3.5**

1. **Via Hugging Face**  
   - **ONNX** or **GGML** formats (depending on your runtime).  
   - Command example (ONNX):
     ```bash
     pip install huggingface-hub onnxruntime
     huggingface-cli download microsoft/Phi-3.5-mini-instruct-onnx --local-dir ./phi35
     ```
2. **Via Ollama**  
   - If you have [Ollama](https://github.com/jmorganca/ollama) installed:
     ```bash
     ollama pull phi3.5
     ```
3. **Mobile Deployment**  
   - Some community forks provide **GGUF** quantized versions for minimal resource usage.

---

### **3. Key Differences: Claude 3.5 Sonnet vs. Claude 3.5 Haiku**

- **Claude 3.5 Sonnet**  
  - Higher reasoning benchmarks (MMLU, HumanEval).  
  - Includes **multimodal** features (beta).  
  - More expensive but handles complex tasks with better accuracy.

- **Claude 3.5 Haiku**  
  - Faster inference speed.  
  - Lower cost per million tokens.  
  - Excellent for quick prototypes and lighter tasks.

---

### **4. Best Practices**

1. **Model Selection**  
   - Default to **Phi 3.5** for local inference.  
   - Switch to a specialized model only if needed (e.g., GPT-4o for multimodal input).  
   - Use **Sonar** series for **search-augmented** tasks.

2. **Versioning**  
   - Use `:latest` for development or testing.  
   - Lock to specific date-stamped versions for production.  
   - Periodically review release notes for updates.

3. **Context Window Management**  
   - Monitor token usage carefully (especially for 128K–200K contexts).  
   - Implement chunking or summarization if input is too large.

4. **Fallback & Error Handling**  
   - Have a fallback model (e.g., `llama-3.3-70b-versatile`) configured.  
   - Log errors and fallback triggers.  
   - Use partial streaming for large outputs.

5. **Security**  
   - Strictly validate user inputs.  
   - Rate-limit API calls.  
   - Monitor resource usage to avoid denial-of-service.

---

### **5. Implementation Snippet**

```typescript
import { logger } from '../utils/logger';
import { TokenCounter } from './utils/tokenCounter';
import { createModelClient } from './api/modelClients';
import { LocalModelClient } from './local/localModelClient';
import type { ModelResponse } from './api/modelClients';

export interface ModelConfig {
  provider: string;
  parameters?: number;
  contextWindow: number;
  maxOutput?: number;
  keyStrengths: string[];
  modelCard?: string;
  apiEndpoint?: string;
}

export interface ModelResponse {
  text: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  error?: string;
}

// Approved models configuration based on models.md
export const models: Record<string, ModelConfig> = {
  'gpt-4o': {
    provider: 'OpenAI',
    contextWindow: 128000,
    maxOutput: 16384,
    keyStrengths: ['Versatile flagship model', 'Text/image input'],
    modelCard: 'https://platform.openai.com/docs/models',
    apiEndpoint: 'gpt-4o-2024-11-06'
  },
  'gpt-4o-mini': {
    provider: 'OpenAI',
    contextWindow: 128000,
    maxOutput: 16384,
    keyStrengths: ['Fast', 'Affordable for focused tasks'],
    modelCard: 'https://platform.openai.com/docs/models',
    apiEndpoint: 'gpt-4o-mini-2024-07-18'
  },
  'o1': {
    provider: 'OpenAI',
    contextWindow: 200000,
    maxOutput: 100000,
    keyStrengths: ['Complex reasoning capabilities'],
    modelCard: 'https://platform.openai.com/docs/models',
    apiEndpoint: 'o1-2024-12-01'
  },
  'qwq-32b': {
    provider: 'Qwen',
    parameters: 32500000000,
    contextWindow: 32768,
    keyStrengths: ['Strong in math/coding', 'Experimental research'],
    modelCard: 'https://huggingface.co/Qwen/QwQ-32B-Preview',
    apiEndpoint: 'Qwen/QwQ-32B-Preview'
  },
  'llama-3.3-70b': {
    provider: 'Groq',
    parameters: 70000000000,
    contextWindow: 128000,
    maxOutput: 32768,
    keyStrengths: ['Versatile large language model'],
    modelCard: 'https://console.groq.com/docs/models',
    apiEndpoint: 'llama-3.3-70b-versatile'
  },
  'claude-3.5-sonnet': {
    provider: 'Anthropic',
    contextWindow: 200000,
    keyStrengths: ['Most intelligent model', 'Text/image input'],
    modelCard: 'https://docs.anthropic.com/en/docs/about-claude',
    apiEndpoint: 'claude-3-5-sonnet-v2@20241022'
  },
  'claude-3.5-haiku': {
    provider: 'Anthropic',
    contextWindow: 200000,
    keyStrengths: ['Fastest Claude 3.5 model'],
    modelCard: 'https://docs.anthropic.com/en/docs/about-claude',
    apiEndpoint: 'claude-3-5-haiku@20241022'
  },
  'phi-3.5': {
    provider: 'Ollama',
    parameters: 3800000000,
    contextWindow: 128000,
    keyStrengths: ['Lightweight', 'Strong performance', 'Local inference'],
    modelCard: 'https://ollama.com/library/phi3.5',
    apiEndpoint: 'phi3.5:latest'
  },
  'sonar-small': {
    provider: 'Perplexity',
    parameters: 8000000000,
    contextWindow: 127072,
    keyStrengths: ['Fast online search capabilities'],
    modelCard: 'https://docs.perplexity.ai/guides/model-cards',
    apiEndpoint: 'llama-3.1-sonar-small-128k-online'
  },
  'sonar-large': {
    provider: 'Perplexity',
    parameters: 70000000000,
    contextWindow: 127072,
    keyStrengths: ['Advanced reasoning with integrated search'],
    modelCard: 'https://docs.perplexity.ai/guides/model-cards',
    apiEndpoint: 'llama-3.1-sonar-large-128k-online'
  }
};

// Default configuration
export const defaultConfig = {
  localModel: 'phi-3.5',
  fallbackModel: 'llama-3.3-70b',
  temperature: 0.7,
  maxTokens: 4096,
  topP: 0.9,
  frequencyPenalty: 0.0,
  presencePenalty: 0.0
};

// Initialize local model client
const localClient = new LocalModelClient();

// Response generation with proper error handling
export async function generateResponse(
  prompt: string,
  modelName?: string,
  options: Partial<typeof defaultConfig> = {}
): Promise<ModelResponse> {
  try {
    const model = getModel(modelName);
    const config = { ...defaultConfig, ...options };

    // Validate input length
    if (!TokenCounter.validateContextLength(prompt, model.contextWindow)) {
      throw new Error(`Prompt exceeds maximum context length of ${model.contextWindow} tokens`);
    }

    // Local model handling
    if (isLocalModel(model.apiEndpoint || '')) {
      logger.info('Using local Phi-3.5 model');
      return await localClient.generate(prompt, config);
    }

    // API model handling
    logger.info(`Using ${model.provider} model: ${model.apiEndpoint}`);
    const client = createModelClient(model);
    return await client.generate(prompt, config);
  } catch (error) {
    logger.error('Error generating response:', error);
    
    // Attempt fallback if not already using fallback model
    if (modelName !== defaultConfig.fallbackModel) {
      logger.info(`Attempting fallback to ${defaultConfig.fallbackModel}`);
      return generateResponse(prompt, defaultConfig.fallbackModel, options);
    }

    return {
      text: '',
      usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

// Model selection utility
export function getModel(modelName?: string): ModelConfig {
  if (!modelName || !models[modelName]) {
    logger.info(`Using default local model: ${defaultConfig.localModel}`);
    return models[defaultConfig.localModel];
  }
  return models[modelName];
}

// Model capability checks
export function supportsVision(modelName: string): boolean {
  const model = models[modelName];
  return model?.keyStrengths.some(strength => 
    strength.toLowerCase().includes('image') || 
    strength.toLowerCase().includes('vision')
  );
}

export function supportsSearch(modelName: string): boolean {
  return modelName.startsWith('sonar-');
}

export function isLocalModel(modelName: string): boolean {
  return modelName === 'phi-3.5';
}
```

---

### **6. Final Notes**

- **Older or unlisted models** are prohibited to avoid confusion or legacy behavior.  
- For **any** specialized tasks not covered by the above list, consult the team lead before adding a new model.  
- Always **log model usage** for traceability and debugging purposes.

---

**End of System Prompt**