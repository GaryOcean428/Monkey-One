import { json } from '../utils/response'
import { generateAIResponse, streamAIResponse, generateRAGResponse } from '../../lib/ai'
import { z } from 'zod'

// Schema for validation
const requestSchema = z.object({
  prompt: z.string().min(1, 'Prompt is required'),
  system: z.string().optional(),
  useRag: z.boolean().optional().default(false),
  stream: z.boolean().optional().default(false),
})

/**
 * AI text generation endpoint
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validated = requestSchema.parse(body)

    const { prompt, system, useRag, stream } = validated

    // Stream the response if requested
    if (stream) {
      const stream = await streamAIResponse(prompt, system)
      return new Response(stream)
    }

    // Use RAG if requested
    if (useRag) {
      const response = await generateRAGResponse({
        query: prompt,
        systemPrompt: system,
      })

      return json({ response })
    }

    // Standard response generation
    const response = await generateAIResponse(prompt, system)
    return json({ response })
  } catch (error) {
    console.error('AI API error:', error)
    return json({ error: 'Failed to generate AI response' }, { status: 500 })
  }
}
