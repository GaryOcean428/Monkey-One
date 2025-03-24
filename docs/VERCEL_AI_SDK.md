# Vercel AI SDK Integration Guide

## Overview

This document provides a comprehensive guide on how we've integrated the Vercel AI SDK into Monkey-One to enable advanced AI features.

## Features Implemented

### 1. Streaming Text Generation

We've implemented streaming text generation to provide real-time responses and improve user experience. Streaming allows responses to be displayed to the user as they are generated, rather than waiting for the entire response to complete.

```typescript
// Server-side implementation
import { streamText } from 'ai';
import { openaiModel } from './config';

export async function streamAIResponse(prompt: string, systemPrompt?: string) {
  const stream = await streamText({
    model: openaiModel,
    prompt,
    system: systemPrompt,
    temperature: 0.7,
  });
  
  return stream;
}
```

Client-side implementation uses standard ReadableStream API to process the streamed response:

```typescript
const response = await fetch('/api/ai', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prompt,
    system: 'You are a helpful assistant.',
    stream: true,
  }),
});

const reader = response.body?.getReader();
const decoder = new TextDecoder();

while (!done) {
  const { value, done: doneReading } = await reader.read();
  if (value) {
    const chunk = decoder.decode(value, { stream: true });
    // Update UI with the streamed chunk
  }
}
```

### 2. Structured Data Generation

We've added the ability to generate structured, type-safe data directly from AI models using Zod schemas:

```typescript
import { generateObject } from 'ai';
import { z } from 'zod';

// Define a schema for sentiment analysis
const schema = z.object({
  sentiment: z.enum(['positive', 'neutral', 'negative']),
  confidence: z.number().min(0).max(1),
  summary: z.string(),
  keywords: z.array(z.string()),
});

// Generate structured data from the AI model
const result = await generateStructuredData({
  prompt: "Analyze the sentiment of this text: 'I love this product!'",
  schema,
  systemPrompt: 'You are a sentiment analysis assistant.',
});

// Access strongly-typed result
console.log(result.sentiment); // 'positive'
console.log(result.confidence); // 0.95
```

### 3. Retrieval Augmented Generation (RAG)

We've implemented a RAG system that combines vector search with AI generation for context-aware responses:

1. Document storage in vector database
2. Query-time retrieval of relevant context
3. Context-enhanced generation

```typescript
// Adding documents to the knowledge base
await addDocumentsToRAG([
  { 
    text: "Our pricing policy states that refunds are available within 30 days of purchase.",
    metadata: { source: "pricing.pdf", page: 2 } 
  }
]);

// Generating a RAG-enhanced response
const response = await generateRAGResponse({
  query: "What is our refund policy?",
  systemPrompt: "You are a helpful customer service agent.",
  maxResults: 3,
});
```

## Implementation Details

### API Layer

The AI functionality is exposed through a unified API endpoint at `/api/ai`:

```typescript
export async function POST(request: Request) {
  const { prompt, system, useRag, stream } = await request.json();
  
  // Handle streaming requests
  if (stream) {
    const stream = await streamAIResponse(prompt, system);
    return new Response(stream);
  }
  
  // Handle RAG requests
  if (useRag) {
    const response = await generateRAGResponse({
      query: prompt,
      systemPrompt: system,
    });
    
    return json({ response });
  }
  
  // Standard response generation
  const response = await generateAIResponse(prompt, system);
  return json({ response });
}
```

### Configuration

The AI SDK is configured in `src/lib/ai/config.ts`:

```typescript
import { OpenAIClient } from '@ai-sdk/openai';
import { createLanguageModel } from 'ai';

export const openaiModel = createLanguageModel(new OpenAIClient({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
  organization: import.meta.env.VITE_OPENAI_ORG_ID || undefined,
}));

export const aiConfig = {
  defaultModel: openaiModel,
  ragEnabled: true,
  temperature: 0.7,
  maxTokens: 2048,
  streamingEnabled: true,
};
```

## UI Components

We've created dedicated UI components for different AI features:

1. `AIStreamingChat.tsx` - Demonstrates streaming responses
2. `RAGChatInterface.tsx` - Provides a RAG-powered chat experience with document upload capabilities

## Future Enhancements

1. **Multi-provider Support**: Add support for additional AI providers (Claude, Mistral, etc.)
2. **Custom Tools**: Implement domain-specific tools that the AI can invoke
3. **Advanced RAG Techniques**: Implement hybrid search, re-ranking, and multi-step RAG
4. **OpenTelemetry Integration**: Add tracing for observability of AI operations
5. **Fine-tuning Interface**: Create UI for fine-tuning models on custom data

## Resources

- [Vercel AI SDK Documentation](https://sdk.vercel.ai/docs)
- [Zod Schema Documentation](https://zod.dev)
- [OpenAI Documentation](https://platform.openai.com/docs/api-reference)
- [Vector Database Documentation](/docs/database.md)