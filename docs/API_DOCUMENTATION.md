# API Documentation

## Model References

### Groq Models

- `llama-3.2-70b-preview`: Latest LLaMA 3.2 70B model
- `llama-3.2-7b-preview`: Latest LLaMA 3.2 7B model
- `llama3-groq-70b-8192-tool-use-preview`: Tool-optimized 70B model
- `llama3-groq-8b-8192-tool-use-preview`: Tool-optimized 8B model

Documentation: <https://console.groq.com/docs/models>

### Perplexity Models

- `llama-3.1-sonar-small-128k-online` (8B parameters)
- `llama-3.1-sonar-large-128k-online` (70B parameters)
- `llama-3.1-sonar-huge-128k-online` (405B parameters)

Documentation: <https://docs.perplexity.ai/guides/model-cards>

### XAI (Grok) Models

- `grok-beta`: Latest Grok model optimized for coding and analysis

Documentation: <https://docs.x.ai/api>

### Huggingface Models

- `Qwen/Qwen2.5-Coder-32B-Instruct`: Specialized coding model
- `ibm-granite/granite-3.0-8b-instruct`: IBM's Granite code model

Documentation:

- Qwen: <https://huggingface.co/Qwen/Qwen2.5-Coder-32B-Instruct>
- Granite: <https://huggingface.co/collections/ibm-granite/granite-code-models-6624c5cec322e4c148c8b330>

## Usage Examples

### Groq

```typescript
const groq = new GroqProvider(apiKey);
const response = await groq.sendMessage("Write a function to calculate fibonacci numbers");
```

### Perplexity

```typescript
const perplexity = new PerplexityProvider(apiKey);
const response = await perplexity.sendMessage("Explain the time complexity of quicksort");
```

### Qwen

```typescript
const qwen = new QwenProvider(token);
const response = await qwen.sendMessage("Generate a React component for a todo list");
```

### Granite

```typescript
const granite = new GraniteProvider(token);
const response = await granite.sendMessage("Refactor this code to use async/await");
```

## Model Selection Guidelines

1. **Code Generation**
   - Primary: Qwen 2.5 Coder
   - Backup: Granite 3.0

2. **Code Analysis**
   - Primary: Grok Beta
   - Backup: LLaMA 3.2 70B

3. **General Tasks**
   - Primary: Perplexity Sonar Large
   - Backup: LLaMA 3.2 70B

4. **Tool Use**
   - Primary: LLaMA 3 Groq 70B Tool
   - Backup: LLaMA 3 Groq 8B Tool

## Performance Considerations

- Groq offers the fastest inference times
- Perplexity provides best-in-class context handling
- Qwen excels at code-specific tasks
- Granite offers good performance for smaller models

## Error Handling

All providers implement standard error handling:

- Network errors
- Rate limiting
- Invalid responses
- Token limits
- Stream interruptions

## Security Notes

1. API keys should be rotated regularly
2. Use environment variables for key storage
3. Implement rate limiting
4. Monitor usage patterns
5. Validate inputs and outputs
