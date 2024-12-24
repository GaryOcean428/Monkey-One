# Model Configuration

## Available Models

### Meta LLaMA Models
- **LLaMA 3.3 70B** - `llama-3.3-70b`
  - Model ID: `llama-3.3-70b-specdec`
  - Context: 8K tokens
  - Best for: Complex reasoning and high-quality code generation

- **LLaMA 3.1 70B** - `llama-3.1-70b`
  - Model ID: `llama-3.1-70b-specdec`
  - Context: 8K tokens
  - Best for: Complex reasoning and code generation

- **LLaMA 3.2 1B** - `llama-3.2-1b`
  - Model ID: `llama-3.2-1b-preview`
  - Context: 128K tokens
  - Best for: Fast, efficient responses

- **LLaMA 3.2 3B** - `llama-3.2-3b`
  - Model ID: `llama-3.2-3b-preview`
  - Context: 128K tokens
  - Best for: Balanced performance and efficiency

- **LLaMA 3.2 11B Vision** - `llama-3.2-11b-vision`
  - Model ID: `llama-3.2-11b-vision-preview`
  - Context: 128K tokens
  - Best for: Vision-language tasks and multimodal reasoning

- **LLaMA 3.2 90B Vision** - `llama-3.2-90b-vision`
  - Model ID: `llama-3.2-90b-vision-preview`
  - Context: 128K tokens
  - Best for: Advanced vision-language tasks and complex reasoning

### Anthropic Models
- **Claude 3.5 Sonnet** - `claude-3.5-sonnet`
  - Model ID: `claude-3-5-sonnet-20241022`
  - Context: 200K tokens
  - Best for: Complex reasoning and tool use

- **Claude 3.5 Haiku** - `claude-3.5-haiku`
  - Model ID: `claude-3-5-haiku-20241022`
  - Context: 200K tokens
  - Best for: Fast, efficient responses

### Groq LLaMA Models
- **LLaMA 3 Groq 70B** - `llama3-groq-70b`
  - Model ID: `llama3-groq-70b-8192-tool-use-preview`
  - Context: 8K tokens
  - Best for: Fast inference with tool use capabilities

- **LLaMA 3 Groq 8B** - `llama3-groq-8b`
  - Model ID: `llama3-groq-8b-8192-tool-use-preview`
  - Context: 8K tokens
  - Best for: Quick responses and efficient tool use

## Model Capabilities

Each model has different capabilities:
- **Code Generation**: All models
- **Tool Use**: All models
- **Vision**: LLaMA 3.2 Vision models
- **Long Context**: LLaMA 3.2 and Claude 3.5 models
- **Fast Inference**: Groq models and smaller LLaMA models

## Configuration

Models can be configured through environment variables:
```env
VITE_DEFAULT_MODEL=llama-3.3-70b
VITE_FALLBACK_MODEL=llama3-groq-8b
```

## Usage

```typescript
import { models, generateText } from '../lib/models';

// Use default model
const response = await generateText(defaultModel, "Write a function that...");

// Use specific model
const response = await generateText(models['llama-3.2-11b-vision'], "Analyze this image...");

// Configure generation parameters
const response = await generateText(defaultModel, prompt, {
  temperature: 0.7,
  maxTokens: 1000,
  tools: [{
    type: 'function',
    function: {
      name: 'searchCode',
      description: 'Search through codebase',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Search query'
          }
        }
      }
    }
  }]
});
```

## Best Practices

1. **Model Selection**
   - Use `llama-3.3-70b` as default for most tasks
   - Use `llama3-groq-8b` for quick responses
   - Use LLaMA 3.2 Vision models for image tasks
   - Use Claude 3.5 models for complex reasoning

2. **Context Management**
   - Stay within context limits
   - Use chunking for long inputs
   - Clear context when switching tasks

3. **Error Handling**
   - Always handle API errors
   - Implement fallback models
   - Monitor token usage

4. **Performance**
   - Use Groq models for fast inference
   - Cache responses when possible
   - Use streaming for long outputs
   - Implement rate limiting
