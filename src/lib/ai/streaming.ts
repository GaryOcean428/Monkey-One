import { ToolCall, ToolResult } from 'ai'
import { getOpenAIClient } from './config'
import { z } from 'zod'

/**
 * Generate text with the OpenAI model (non-streaming)
 */
export async function generateAIResponse(prompt: string, systemPrompt?: string) {
  try {
    const openai = getOpenAIClient()
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
    })

    return response.choices[0]?.message?.content || ''
  } catch (error) {
    console.error('Error generating AI response:', error)
    throw error
  }
}

/**
 * Stream text with the OpenAI model
 */
export async function streamAIResponse(prompt: string, systemPrompt?: string) {
  try {
    const openai = getOpenAIClient()
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      stream: true,
    })

    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of response) {
          const content = chunk.choices[0]?.delta?.content || ''
          if (content) {
            const encoder = new TextEncoder()
            controller.enqueue(encoder.encode(content))
          }
        }
        controller.close()
      },
    })

    return stream
  } catch (error) {
    console.error('Error streaming AI response:', error)
    throw error
  }
}

/**
 * Generate structured data with the OpenAI model
 */
export async function generateStructuredData<T extends z.ZodType>({
  prompt,
  schema,
  systemPrompt,
}: {
  prompt: string
  schema: T
  systemPrompt?: string
}) {
  try {
    const openai = getOpenAIClient()
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
        {
          role: 'user',
          content: `${prompt}\n\nProvide your response as a valid JSON object matching this schema: ${JSON.stringify(schema.shape)}`,
        },
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    })

    const content = response.choices[0]?.message?.content || '{}'
    const parsedJson = JSON.parse(content)

    // Validate with zod schema
    const result = schema.safeParse(parsedJson)

    if (!result.success) {
      throw new Error(`Failed to generate valid structured data: ${result.error.message}`)
    }

    return result.data as z.infer<T>
  } catch (error) {
    console.error('Error generating structured data:', error)
    throw error
  }
}

// Tool definition schema
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const calculatorToolSchema = {
  name: 'calculator',
  description: 'Calculate a mathematical expression.',
  parameters: z.object({
    expression: z.string().describe('The mathematical expression to evaluate'),
  }),
}

// Tool implementation
export function calculatorTool(
  toolCall: ToolCall<typeof calculatorToolSchema>
): ToolResult<typeof calculatorToolSchema> {
  try {
    const { expression } = toolCall.parameters

    // Parse and evaluate using a safer approach
    // This uses a simple arithmetic expression parser
    const sanitizedExpression = expression.replace(/[^0-9+\-*/().]/g, '')

    // Use a safer approach with Function constructor but with restricted access
    const calculator = new Function(
      'return function(expr) { ' +
        '  const safeMath = { ' +
        '    "+": (a, b) => a + b, ' +
        '    "-": (a, b) => a - b, ' +
        '    "*": (a, b) => a * b, ' +
        '    "/": (a, b) => b === 0 ? (() => { throw new Error("Division by zero") })() : a / b ' +
        '  }; ' +
        '  try { ' +
        '    // Simple expression evaluator' +
        '    return Function("safeMath", `"use strict"; return ${expr}`)(safeMath); ' +
        '  } catch (e) { ' +
        '    throw new Error("Invalid expression"); ' +
        '  } ' +
        '}'
    )(sanitizedExpression)

    const result = calculator
    return { result: String(result) }
  } catch (e) {
    return { error: `Failed to evaluate expression: ${e}` }
  }
}
