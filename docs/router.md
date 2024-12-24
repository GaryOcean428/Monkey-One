# Advanced Router System

The Advanced Router System is a sophisticated model selection and optimization system designed to efficiently route queries to the most appropriate AI model while managing costs and performance.

## Overview

The system consists of three main components:
- **AdvancedRouter**: Core routing logic and model selection
- **TokenEstimator**: Token usage prediction and cost management
- **Model Configuration**: Integration with various AI models

## Features

### 1. Intelligent Model Selection
- Dynamic routing based on query complexity
- Tech stack-aware decision making
- Code complexity analysis
- Context length consideration
- Conversation history analysis

### 2. Cost Optimization
- Token usage prediction
- Automatic model downgrading for simple queries
- Context window management
- Cost estimation and budgeting

### 3. Performance Optimization
- Response strategy selection
- Temperature adjustment
- Token limit optimization
- Conversation chunking

## Usage

### Basic Usage

```typescript
import { AdvancedRouter } from './lib/router';
import { XAIMessage } from './lib/types';

// Initialize router
const router = new AdvancedRouter();

// Route a query
const query = "How do I implement authentication in React?";
const history: XAIMessage[] = [];
const config = router.route(query, history);

console.log(config);
// {
//   model: { id: 'llama-3.3-70b', ... },
//   maxTokens: 1024,
//   temperature: 0.7,
//   responseStrategy: 'chain_of_thought',
//   ...
// }
```

### With Token Estimation

```typescript
import { TokenEstimator } from './lib/tokenEstimator';

// Estimate token usage
const estimate = TokenEstimator.estimateConversationTokens(
  history,
  'coding',
  'chain_of_thought'
);

// Check context limits
if (TokenEstimator.isApproachingContextLimit(estimate, 8192)) {
  const chunkSize = TokenEstimator.suggestChunkSize(
    estimate.totalTokens,
    8192
  );
  console.log(`Suggested chunk size: ${chunkSize} tokens`);
}

// Estimate costs
const cost = TokenEstimator.estimateCost(estimate, 0.0001);
console.log(`Estimated cost: $${cost.toFixed(4)}`);
```

## Model Tiers

### Low Tier (`llama3-groq-8b`)
- Simple queries and casual conversation
- Quick responses
- Cost-effective for basic tasks
- Default for greetings and simple questions

### Mid Tier (`llama-3.2-3b`)
- Standard development queries
- Documentation lookups
- Basic code explanations
- Moderate complexity tasks

### High Tier (`llama-3.3-70b`)
- Complex coding tasks
- Detailed explanations
- TypeScript and React queries
- Advanced problem solving

### Superior Tier (`grok-2`)
- System design
- Architecture planning
- Complex algorithms
- Multi-technology solutions

## Tech Stack Detection

The router automatically detects and optimizes for various tech stacks:

```typescript
const techStacks = {
  typescript: /\b(typescript|ts|type[\s-]safe)\b/i,
  react: /\b(react|hook|component|jsx|tsx)\b/i,
  node: /\b(node|express|nest)\b/i,
  database: /\b(sql|postgres|supabase|prisma)\b/i,
  testing: /\b(test|jest|vitest|cypress)\b/i,
  deployment: /\b(docker|kubernetes|ci|cd|deploy)\b/i,
  security: /\b(auth|oauth|jwt|security)\b/i
};
```

## Code Complexity Analysis

The system analyzes code complexity based on various indicators:

```typescript
const complexityIndicators = {
  dataStructures: /\b(tree|graph|heap|stack|queue)\b/i,
  algorithms: /\b(sort|search|traverse|balance|optimize)\b/i,
  patterns: /\b(design pattern|singleton|factory|observer)\b/i,
  architecture: /\b(architecture|system design|scalable|microservice)\b/i,
  async: /\b(async|await|promise|callback|observable)\b/i,
  performance: /\b(performance|optimize|memory|cpu|complexity)\b/i,
  security: /\b(security|auth|encryption|token|vulnerable)\b/i
};
```

## Response Strategies

The router selects appropriate response strategies:

| Strategy | Use Case | Token Multiplier |
|----------|----------|------------------|
| casual_conversation | Simple chats | 1.0x |
| direct_answer | Factual queries | 1.2x |
| chain_of_thought | Problem solving | 2.0x |
| boolean_with_explanation | Yes/no questions | 1.5x |
| comparative_analysis | Analysis tasks | 2.5x |
| open_discussion | Open-ended queries | 1.8x |
| code_generation | Coding tasks | 3.0x |
| debug_explanation | Debugging help | 2.5x |

## Token Estimation

The system uses different token ratios for different content types:

| Content Type | Tokens per Character |
|--------------|---------------------|
| English | 0.25 |
| Code | 0.35 |
| JSON | 0.40 |

## Best Practices

1. **Cost Management**
   - Use lower tiers for simple queries
   - Monitor token usage
   - Implement cost budgeting
   - Use chunking for long conversations

2. **Performance Optimization**
   - Clear context when switching topics
   - Use appropriate response strategies
   - Monitor and adjust temperature
   - Implement retry logic for failures

3. **Context Management**
   - Stay within model limits
   - Use chunking for long inputs
   - Clear context when switching tasks
   - Monitor conversation length

4. **Error Handling**
   - Implement fallback models
   - Handle API errors gracefully
   - Monitor rate limits
   - Log routing decisions

## Testing

Run the test suite:

```bash
npm test src/lib/__tests__/router.test.ts
```

The test suite covers:
- Route selection logic
- Token estimation
- Cost calculation
- Tech stack detection
- Code complexity analysis
- Parameter adjustment
- Context management

## Contributing

1. Follow TypeScript best practices
2. Add tests for new features
3. Update documentation
4. Use consistent code style
5. Run the test suite before submitting

## License

MIT License - See LICENSE file for details
