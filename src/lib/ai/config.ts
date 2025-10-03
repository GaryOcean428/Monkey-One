import OpenAI from 'openai'

// AI SDK configuration
export const aiConfig = {
  ragEnabled: true,
  temperature: 0.7,
  maxTokens: 2048,
  streamingEnabled: true,
}

// Get the OpenAI client
export function getOpenAIClient() {
  return new OpenAI({
    apiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
    organization: import.meta.env.VITE_OPENAI_ORG_ID,
  })
}
