import { XAI_CONFIG } from './config';
import type { XAIMessage, XAIResponse, XAIEmbeddingResponse } from './types';

export class APIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public response?: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export async function makeAPIRequest<T>(
  endpoint: string,
  apiKey: string,
  body: unknown
): Promise<T> {
  try {
    const response = await fetch(`${XAI_CONFIG.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new APIError(
        'API request failed',
        response.status,
        errorText
      );
    }

    return response.json();
  } catch (error) {
    if (error instanceof APIError) throw error;
    throw new APIError(
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}